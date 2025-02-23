---
title: SQLAlchemy Performance on Query Builder, Selects and Inserts
slug: sqlalchemy-performance-query-builder-select-inserts
description: Quickly learn how to choose the appropriate abstraction level for your use case. SQLAlchemy is a large library with a lot of features and it can be overwhelming to choose the right one. So I made a simple guide to help you choose the appropriate abstraction level for your use case.
tags: ["python", "sqlalchemy", "database"]
pubDate: "2024-11-22"
updatedDate: "2025-02-19"
---

After using SQLAlchemy for some years in various projects, I can say it's been an amazing tool despite its occasional quirks. Like any ORM, it comes with trade-offs, but what sets SQLAlchemy apart is its flexibility in handling these limitations. SQLAlchemy gives developer from higher level access to lower level access to handling these queries and let the dev choose the approach to solve their problem. Let me share my benchmarks that I did to find the best approach for my use case.



![image.png](/assets/sqlalchemy-performance-query-builder-select-inserts/image.png)



## Performance Benchmarks

### Query Building Performance

| Batch Size | SQLAlchemy Core | Raw SQL | SQLAlchemy ORM |
| ---------- | --------------- | ------- | -------------- |
| 1000       | 15x             | 1x      | 30x            |
| 10000      | 10x             | 1x      | 15x            |
| 100000     | 11x             | 1x      | 16x            |
| 1000000    | 10x             | 1x      | 17x            |

Note that the relative comparison represent only the SQL string building process! See the higher level SQLAlchemy ORM is 30x slower than the raw SQL, that's insane. The query builder adds this much overhead when constructing the actual SQL query, which will be executed later.

Converting results back to ORM objects also creates overhead. For maximum raw performance, it's best to use lower-level approaches and write efficient queries.

### Large Result Sets

Number of Iterations: 1,000,000

| Description                                                        | MySQL (sec) | PostgreSQL (sec) |
| ------------------------------------------------------------------ | ----------- | ---------------- |
| Load rows using DBAPI fetchall(), don't make any objects           | 5.2         | 1.3              |
| Load rows using DBAPI fetchall(), generate an object for each row  | 5.5         | 1.5              |
| Load individual columns into named tuples using the ORM            | 6.6         | 2.5              |
| Load Core result rows using fetchall                               | 6.9         | 3.2              |
| Load Core result rows using fetchmany/streaming                    | 7.0         | 3.4              |
| Load lightweight "bundle" objects using the ORM                    | 7.6         | 3.5              |
| Load Core result rows using Core / fetchmany                       | 6.8         | 3.6              |
| Load Core result rows using fetchall                               | 7.0         | 3.9              |
| Load fully tracked ORM objects a chunk at a time using yield_per() | 10.0        | 8.5              |
| Load fully tracked ORM objects into one big list()                 | 13.8        | 15.0             |


From the table above, we can see that the ORM struggles with large result sets. The raw DBAPI calls are the fastest. This is because the ORM has to create a lot of objects and this adds overhead to the performance.


### Code Snippets for Loading Large Result Sets

1. Load rows using DBAPI fetchall(), don't make any objects
   ```python
   cursor.execute(sql)
   [row[0:3] for row in cursor.fetchall()]
   ```

2. Load rows using DBAPI fetchall(), generate an object for each row
   ```python
   cursor.execute(sql)
   [
      SimpleCustomer(id_=row[0], name=row[1], description=row[2])
      for row in cursor.fetchall()
   ]
   ```

3. Load individual columns into named tuples using the ORM
   ```python
   (
      session.query(Customer.id, Customer.name, Customer.description)
         .yield_per(10000)
         .limit(n)
   )
   ```

4. Load Core result rows using fetchall
   ```python
   (
      conn.execute(Customer.__table__.select().limit(n))
         .mappings()
         .fetchall()
   )
   ```

5. Load Core result rows using fetchmany/streaming
   ```python
   (
      conn.execution_options(stream_results=True)
         .execute(Customer.__table__.select().limit(n))
   )
   ```

6. Load lightweight "bundle" objects using the ORM
   ```python
   (
      session.query(
         Bundle("customer", Customer.id, Customer.name, Customer.description)
      ).yield_per(10000)
   )
   ```

7. Load Core result rows using Core / fetchmany
   ```python
   result = conn.execute(Customer.__table__.select().limit(n))
   result.fetchmany(10000)
   ```

8. Load Core result rows using fetchall
   ```python
   conn.execute(Customer.__table__.select().limit(n)).fetchall()
   ```

9. Load fully tracked ORM objects a chunk at a time using yield_per()
   ```python
   session.query(Customer).yield_per(1000).limit(n)
   ```

10. Load fully tracked ORM objects into one big list
    ```python
    list(session.query(Customer).limit(n))
    ```


### Bulk Inserts

| Description                                                                                    | 1K (s) | 10K (s) | 100K (s) | 1M (s) |
| ---------------------------------------------------------------------------------------------- | ------ | ------- | -------- | ------ |
| Batched INSERT statements via the ORM in "bulk", returning new Customer objects                | 0.04   | 0.8     | 8        | 92     |
| A single Core INSERT construct inserting mappings in bulk                                      | 0.12   | 0.4     | 3        | 34     |
| The DBAPI's API inserting rows in bulk                                                         | 0.12   | 0.4     | 4        | 35     |
| Batched INSERT statements via the ORM in "bulk", not returning rows                            | 0.07   | 0.4     | 4        | 41     |
| INSERT statements via the ORM (batched with RETURNING if available), fetching generated row id | 0.05   | 0.8     | 9        | 101    |
| Batched INSERT statements via the ORM, PKs already defined                                     | 0.16   | 1.0     | 11       | 111    |


Inserting a row is a relatively expensive operation. And with the increasing number of rows, the performance degrades significantly. I usually prefer batched inserts, as this saves memory and faster.


### Code Snippets for Bulk Inserts

1. Batched INSERT statements via the ORM in "bulk", returning new Customer objects
   ```python
   session.scalars(
      insert(Customer).returning(Customer),
      [
         {"name": "customer %d" % i, "description": "customer %d" % i}
         for i in range(n)
      ],
   )
   ```

2. A single Core INSERT construct inserting mappings in bulk
   ```python
   conn.execute(
    Customer.__table__.insert(),
      [
         {"name": "customer %d" % i, "description": "customer %d" % i}
         for i in range(n)
      ],
   )
   ```

3. The DBAPI's API inserting rows in bulk
   ```python
   cursor.executemany(
      str(compiled),
      [("customer %d" % i, "customer %d" % i) for i in range(n)],
   )
   ```

4. Batched INSERT statements via the ORM in "bulk", not returning rows
   ```python
   session.execute(
      insert(Customer),
      [
         {"name": "customer %d" % i, "description": "customer %d" % i}
         for i in range(n)
      ],
   )
   ```

5. INSERT statements via the ORM (batched with RETURNING if available), fetching generated row id
   ```python
   session.add_all(
      [
         Customer(name="customer %d" % i, description="customer %d" % i)
         for i in range(chunk, chunk + 1000)
      ]
   )
   session.flush()
   ```

6. Batched INSERT statements via the ORM, PKs already defined
   ```python
   session.add_all(
      [
         Customer(
            id=i + 1,
            name="customer %d" % i,
            description="customer %d" % i,
         )
         for i in range(chunk, chunk + 1000)
      ]
   )
   session.flush()
   ```


### Choosing the Appropriate Abstraction Level
Based on comprehensive benchmarks and understanding the trade-offs, here are the recommended approaches for different scenarios:

- **Raw SQL/DBAPI**: Optimal for maximum performance in bulk operations
- **SQLAlchemy Core**: Recommended for bulk operations requiring SQL generation benefits
- **ORM Bulk Operations**: Suitable for batch operations requiring ORM features
- **Full ORM**: Best for complex operations requiring complete object functionality

### Data Loading Performance Analysis

PostgreSQL benchmark results demonstrate the following performance patterns:

- Raw DBAPI fetch: 1.31 seconds
- ORM Column Loading: 2.48 seconds
- Core Operations: ~3.5 seconds
- Full ORM Objects: 8.53-15.05 seconds


**All the analysis and benchmark was done using SQLAlchemy's [example scripts](https://github.com/sqlalchemy/sqlalchemy/tree/main/examples)**
