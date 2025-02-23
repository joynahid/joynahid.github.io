---
title: "Database Session Management in FastAPI: Best Practices and Pitfalls"
slug: database-session-management-in-fastapi
description: Handling DB sessions isn't as easy as it seems. There are a lot of things to consider like connection pooling, session management, transaction management and error handling. This article will cover things for postgres and sqlalchemy.
tags: ["fastapi", "python", "database", "sqlalchemy", "postgres"]
pubDate: "2024-12-05"
heroImage: '/assets/database-session-management-in-fastapi/db-pooling.png'
---

Handling DB sessions isn't as easy as it seems. There are a lot of things to consider like connection pooling, session management, and error handling. There're a lot of situations where things can go wrong with the database connection or sessions, like the database connection being lost or timing out. Or the sessions are being incrementally leaked like the following:

![Leaked db session (continuosly increasing, currently at 69+)](/assets/database-session-management-in-fastapi/high_db_session.png)

Well, straight forward, this is clear that db sessions are not being closed properly. Is there other reasons? Let's find out.

This article will cover things for postgres and sqlalchemy. I'm pretty sure other database drivers and ORMs might have similar issues and relevant solutions.

Another way the database sessions can be increased is when some query/transaction is not being committed/rolled back. This can lock the database connection and not being able to be used.

So, when designing the database session management, we need to consider the following:

1. Connection pooling
2. Session management
3. Transaction management
4. Error handling
5. Anything else?

Well let's start with the basics.

We can easily initialize the database session with the following:

```python
# the engine is the main point of contact with the database
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

# the sessionmaker is used to create new Session objects
from sqlalchemy.orm import sessionmaker

from sqlalchemy.pool import NullPool

# create the engine
queuepool_engine = create_async_engine('postgresql+psycopg2://user:password@host:port/database')
nullpool_engine = create_async_engine('postgresql+psycopg2://user:password@host:port/database', poolclass=NullPool)

# create the sessionmaker, use the async_sessionmaker in >= SQLAlchemy 2.0
Session = async_sessionmaker(bind=engine)
```

Well, that's it. We got the engine and the sessionmaker to create unlimited sessions. Easy peasy.

We are going to use sqlalchemy as the ORM and psycopg2 as the database driver. SQLAlchemy is awesome, but it has a lot of tools to configure and it's not that easy to understand in the first go.


### Building the Session Maker

Session maker is the most important part of the database session management. It's the one that creates the session objects. We can configure the session maker with the following options:

- `autocommit`: Whether to automatically commit the session after each operation. Normally, we don't want to do this.
- `autoflush`: Whether to automatically flush the session after each operation. Normally, we don't want to do this.
- `expire_on_commit`: Whether to expire the session after the commit. This can be either `True` or `False`. If `True`, the session will be expired after the commit. If `False`, the session will not be expired after the commit. So set your flag accordingly.


We can build multiple combinations of the session maker. For example, we can set the `autocommit` to `True` and `autoflush` to `False`. This will make the session to be committed after each operation and not flushed after each operation.

```python
# Different session makers
AutoCommitSession = sessionmaker(bind=engine, autocommit=True, autoflush=False)
ExpireAfterCommitSession = sessionmaker(bind=engine, expire_on_commit=False)
AutoFlushSession = sessionmaker(bind=engine, autoflush=True, autocommit=False)
```

### Configuring Connection Pool

A connection pool maintains a fixed number of database connections that can be reused across requests. Without pooling, a high-traffic server handling 1000 requests/second would try to create 1000 separate database connections - which is extremely inefficient. Instead, we can maintain a small pool (e.g., 20 connections) that gets reused across all incoming requests.

To configure the pool size:

```python
engine = create_async_engine(
    'postgresql+psycopg2://user:password@host:port/database',
    pool_size=20,
    max_overflow=5,
    pool_recycle=1800,
    connect_args={"timeout": 30},
)
```

Here,
- `pool_size` is the number of connections to keep in the pool.
- `max_overflow` is the maximum number of connections to allow in the pool beyond the pool size. That means, if the pool size is 20 and `max_overflow` is 5, the pool can grow to 25 connections.
- `pool_recycle` is the number of seconds after which the connection will be recycled. This is to ensure that the connection is recycled after a certain period of time. Tweak the value based on your database's timeout.
- `connect_args` is the arguments to pass to the database driver. In this case, we are passing the `timeout` argument to the database driver. This will throw an error if the connection is not established within 30 seconds. Ever been stuck with a non-running database connection without a clue?
    ```bash
    TimeoutError: [Errno 110] Connection timed out
    ```

The `pool_recycle` (sane way of doing it) will save you from the following kind of error:

```bash
raise exceptions.InterfaceError('connection is closed')
```

Another way to handle this is to use the `pool_pre_ping` option. This will ping the database connection before using it. This is to ensure that the connection is still alive. But it will add some overhead to the check it will do before using the connection.


### Session Management

The most crucial part of the session management is to ensure that the session is properly closed after the request is processed. We can do this by using a context manager.

The most simple way to do this is:

```python
def get_session():
    session = Session()
    try:
        yield session
    finally:
        session.close()
```

This is a generator function that yields a session object. The session object is created in the function and closed in the `finally` block. This ensures that the session is properly closed after the request is processed.

You can use this function as a dependency in your FastAPI app:

```python
DBSession = Annotated[Session, Depends(get_session)]

@app.get("/")
async def read_root(session: DBSession):
    return {"message": "Hello, World!"}
```

So, here in each request, a new session is created and closed after the request is processed. This ensures that the session is properly closed after the request is processed.


In some cases, we might want to get the session outside of the fastapi context. We can do this by creating another function using the `contextlib.asynccontextmanager` decorator.


```python
@asynccontextmanager
async def session_context() -> Generator[Session, None, None]:
    """
    Note: Not recommended to use in the fastapi context.
    FastAPI has its own context manager.
    """
    sess = Session()
    try:
        yield sess
    finally:
        await sess.close()
```


### Transaction Management

In real world applications, we need to use transactions, as this will help us to ensure the integrity of the data. We can do this by using the `session.begin()` method.

```python

# In fastapi context
@app.get("/")
async def read_root(session: DBSession):
    try:
        async with session.begin():
            session.add(User(name="John Doe"))
            session.add(User(name="Jane Doe"))
            session.delete(User(name="Jane Doe"))
            await session.commit()
    except Exception as e:
        await session.rollback()
        raise e
```

In some cases, we might want to use the nested transaction. We can do this by using the `session.begin_nested()` method. This is useful when we want to have savepoints in our transaction.

```python
@app.get("/")
async def read_root(session: DBSession):
    async with session.begin():
        # Outer transaction
        session.add(user_object)

        # Nested transaction (savepoint)
        async with session.begin_nested() as nested_session:
            try:
                nested_session.add(order_object)
                raise Exception("Order processing failed")
            except:
                # Rollback only the nested transaction
                await nested_session.rollback()
                print("Nested transaction failed")

        # Outer transaction can still succeed
        await session.commit()
```

I've made a little class to handle the session management.


## Full Implementation

```python showLineNumbers
import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any

from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.ext.asyncio import AsyncConnection
from sqlalchemy.ext.asyncio import AsyncEngine
from sqlalchemy.ext.asyncio import AsyncSession


logger = logging.getLogger(__name__)


# Create the engine outside the class
DATABASE_URL = "your_database_url_here"
engine: AsyncEngine = create_async_engine(DATABASE_URL, echo=False)

# Create the sessionmaker outside the class
SessionMaker = async_sessionmaker(
    autocommit=False,
    bind=engine,
    expire_on_commit=False,
)


class SessionManager:
    def __init__(self, session_maker: async_sessionmaker[AsyncSession]) -> None:
        self._session_maker = session_maker

    async def close(self) -> None:
        """Dispose of the engine."""
        await engine.dispose()

    @asynccontextmanager
    async def connect(self) -> AsyncIterator[AsyncConnection]:
        """Provide a database connection."""
        async with engine.begin() as connection:
            try:
                yield connection
            except Exception:
                await connection.rollback()
                raise

    @asynccontextmanager
    async def session(self) -> AsyncIterator[AsyncSession]:
        """Provide a database session."""
        session = self._session_maker()
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# Instantiate the SessionManager
session_manager = SessionManager(SessionMaker)


async def get_async_session() -> AsyncIterator[AsyncSession]:
    """Provide an async session for dependency injection."""
    async with session_manager.session() as session:
        yield session

```
