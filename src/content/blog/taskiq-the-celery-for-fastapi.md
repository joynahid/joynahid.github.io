---
title: TaskIQ - The Celery for FastAPI, Distributed Task Queue
slug: taskiq-the-celery-for-fastapi
description: TaskIQ is a distributed task queue for FastAPI, similar to Celery but Async.
tags: ["fastapi", "python", "taskiq", "distributed", "task", "queue"]
pubDate: "2024-11-17"
---

FastAPI is awesome. I've been using it for quite a long time now. It has a fantastic ecosystem for handling background jobs and asynchronous tasks. Wondering how? Well, I was working with FastAPI code mostly written in an async fashion and wanted to move some heavy operations to the background. I discovered that FastAPI's background tasks help with returning tasks, but they're not ideal for heavy operations. That's because they can block FastAPI from handling further requests for the entire duration of the heavy task.

FastAPI provides a built-in `BackgroundTasks` utility for simple background jobs, ideal for lightweight tasks that don't require distributed processing.

> FastAPI's BackgroundTasks is actually Starlette's BackgroundTasks.

### Example: Sending an Email in the Background

```python
from fastapi import FastAPI, BackgroundTasks

app = FastAPI()

# Simulated email sending function
def send_email(email: str, subject: str, body: str):
    print(f"Sending email to {email} with subject '{subject}' and body:\n{body}")

@app.post("/send-email/")
async def trigger_email(
    email: str, subject: str, body: str, background_tasks: BackgroundTasks
):
    background_tasks.add_task(send_email, email, subject, body)
    return {"message": "Email will be sent in the background."}
```

In this code, FastAPI automatically injects the BackgroundTasks object into the `trigger_email` function, detecting it through type annotation. This snippet demonstrates sending an email asynchronously via a POST request. The email is processed as a background task using FastAPI's built-in **BackgroundTasks**, allowing the API to respond instantly while the task runs behind the scenes. It's perfect for quick, lightweight operations.

> If the background task involves a blocking operation (e.g., heavy computations), it can halt the event loop — delaying the processing of other incoming requests.

### BackgroundTasks in a Nutshell

| Feature                    | Description                                                                      |
| -------------------------- | -------------------------------------------------------------------------------- |
| Execution Context          | Runs on the same server as FastAPI                                               |
| Simplicity                 | Great for simple tasks like sending emails or logging                            |
| Limitations                | Shares resources with the main FastAPI app, limiting scalability and reliability |
| Distributed Task Execution | Not supported                                                                    |
| Retry Mechanism            | Not supported                                                                    |

After some research online, I discovered an excellent library called TaskIQ. It handles asynchronous tasks perfectly, much like Celery does for synchronous code.

### Convincing factors

The key features and benefits of TaskIQ that make it an attractive choice for handling asynchronous tasks in FastAPI applications. These include active maintenance, support for multiple broker and result backends, rich documentation, and various advanced functionalities like dependency injection and task pipelines.

| Feature name                | Taskiq |
| --------------------------- | ------ |
| Actively maintained         | ✅     |
| Multiple broker backends    | ✅     |
| Multiple result backends    | ✅     |
| Have a rich documentation   | ✅     |
| Startup & Shutdown events   | ✅     |
| Have ability to abort tasks | ❌     |
| Custom serializers          | ✅     |
| Dependency injection        | ✅     |
| Task pipelines              | ✅     |
| Task schedules              | ✅     |
| Global middlewares          | ✅     |


Task cancellation would be an awesome feature, as I'll need it soon in my project. I'm considering developing a separate library for this until it's integrated into TaskIQ.

TaskIQ is highly extensible and can be used with pre-written custom brokers:

| Broker   | Installation Command          |
| -------- | ----------------------------- |
| RabbitMQ | `pip install taskiq-aio-pika` |
| Redis    | `pip install taskiq-redis`    |
| NATS     | `pip install taskiq-nats`     |

I'm using `taskiq-redis` with their `ListQueueBroker`, which ensures each worker receives only one task at a time. They also offer a PubSubBroker for broadcasting tasks to all workers. Consider using that if it suits your needs.

Overall, TaskIQ has been impressive so far and getting the job done for now.
