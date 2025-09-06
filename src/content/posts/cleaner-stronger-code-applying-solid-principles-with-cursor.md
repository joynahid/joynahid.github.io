---
title: "Cleaner, Stronger Code: Applying SOLID Principles with Cursor"
slug: cleaner-stronger-code-applying-solid-principles-with-cursor
description: "Learn how to make AI write clean, maintainable code by applying SOLID principles with Cursor AI. Transform messy 300-line files into structured, testable architecture."
tags: ["cursor", "ai", "solid", "clean-code", "architecture", "python", "best-practices"]
pubDate: "2025-09-07"
heroImage: '/assets/cleaner-stronger-code-applying-solid-principles-with-cursor/cover.png'
---

Picture this: You ask Cursor: "Build me a user login system"

![Cover](/assets/cleaner-stronger-code-applying-solid-principles-with-cursor/cover.png)

What you get: 5 giant 300-line files that do everything. And it WORKS! Until you need to change something. Then it breaks in 5 different places.

Sound familiar? You're not alone. I believe everyone faced this.

But what if I told you there's a simple way to make AI write code that actually stays CLEAN, not MESSY. Code you can maintain without crying?

Let's fix this.

## What Most People Do

**Bad Prompt:**
```
Build me a user registration system
```

**What AI gives you:**

```python
# users.py - Everything mixed together!
def register_user(email, password):
    # Email validation
    if "@" not in email:
        return "Bad email"
    
    # Database stuff
    import sqlite3
    conn = sqlite3.connect("users.db")
    
    # Password hashing
    import hashlib
    hashed = hashlib.md5(password.encode()).hexdigest()
    
    # Save to database
    conn.execute("INSERT INTO users VALUES (?, ?)", (email, hashed))
    
    # Send email
    import smtplib
    # ... 50 more lines of email code
    
    return "User created"
```

**Problems:**
- Everything is mixed together
- Hard to test
- Hard to change
- Breaks easily

## What Pros Do

![What Pros Do](/assets/cleaner-stronger-code-applying-solid-principles-with-cursor/what-pros-do.png)

### Model Selection
Use claude-4-sonnet for all coding tasks and analysis - it's the most capable model available.

### Essential MCP Servers
- **Context7**: Automatic documentation awareness for libraries/frameworks
- **Excel/CSV MCPs**: Let Cursor read/validate file outputs automatically
- **Database MCPs**: Direct database inspection and testing
- **API testing MCPs**: Validate endpoints and responses

### YOLO Mode Setup
Whitelist safe commands for automatic execution.

### Critical Workflow Rule
Commit early and often — before AI makes major changes. One bad iteration can destroy hours of work.

## Better Prompting

**Good Prompt:**
```
Build a user registration system with clean architecture:

SEPARATE CONCERNS:
- UserValidator: Only checks if data is valid
- UserRepository: Only saves/loads users  
- EmailService: Only sends emails
- UserService: Puts everything together

RULES:
- Each class does ONE thing
- Easy to test each part separately
- Easy to swap email providers
- Business logic separate from database
```

**What AI gives you:**

```python
# domain/user.py - Just the user concept
class User:
    def __init__(self, email: str, password: str):
        self.email = email
        self.password = password
    
    def is_valid(self) -> bool:
        return "@" in self.email and len(self.password) >= 8

# services/email_service.py - Just email stuff
class EmailService:
    def send_welcome_email(self, email: str):
        # Only handles sending emails
        pass

# services/user_service.py - Puts it all together
class UserService:
    def __init__(self, user_repo, email_service):
        self.user_repo = user_repo
        self.email_service = email_service
    
    def register_user(self, email: str, password: str):
        user = User(email, password)
        
        if not user.is_valid():
            return "Invalid user data"
        
        self.user_repo.save(user)
        self.email_service.send_welcome_email(email)
        
        return "User created"
```

**Benefits:**
- Each file has one job
- Easy to test each part
- Easy to change email provider
- Clear and simple
- **YOU KNOW WHAT'S HAPPENING IN YOUR CODE**

## Set Up Your AI Rules

Create a folder called `.cursor` in your project. Inside, create `solid-rules.md`:

```
# Python Coding Rules

## Core Principles
- **Single Responsibility**: One class/function = one purpose
- **Short Functions**: Split anything >20 lines
- **Clear Names**: Code should read like documentation

## Architecture
my_app/
├── domain/          # Business logic & entities
├── services/        # Application services & orchestration  
├── repositories/    # Data access layer
└── tests/          # Unit & integration tests

## Separation of Concerns
- **Domain**: Pure business rules, no external dependencies
- **Services**: Coordinate between domain and infrastructure
- **Repositories**: Handle data persistence only

## Testability First
Ask before coding:
- Can I unit test this without a database?
- Can I mock external services (email, APIs)?
- Are dependencies injectable?

If any answer is "no", refactor for better separation.

## Quick Checks
- Business logic in domain layer
- Database code isolated in repositories
- Services are thin orchestration layers
- Tests don't require real infrastructure
```

That's it! Now AI will follow these rules automatically.

## The SOLID Principles

Don't worry — these aren't complicated. Think of them as 5 simple rules:

### S — Single Responsibility (One Job Rule)

```python
# BAD - Does too many things
class User:
    def save_to_database(self): pass
    def send_email(self): pass
    def validate_data(self): pass

# GOOD - Each class has one job  
class User:           # Just holds user data
    pass

class UserRepository: # Just saves users
    def save(self, user): pass

class EmailService:   # Just sends emails
    def send(self, email): pass
```

### O — Open/Closed (Easy to Extend)

```python
# GOOD - Easy to add new payment types
class PaymentProcessor:
    def process(self, payment_method):
        return payment_method.charge()

class CreditCard:
    def charge(self): return "Charged credit card"

class PayPal:  
    def charge(self): return "Charged PayPal"

# Add Bitcoin later without changing existing code
class Bitcoin:
    def charge(self): return "Charged Bitcoin"
```

### L — Liskov Substitution (Swap Without Breaking)

```python
# Any payment method should work the same way
def process_payment(payment_method):
    return payment_method.charge()  # Works with any payment type

process_payment(CreditCard())  # Works
process_payment(PayPal())      # Works  
process_payment(Bitcoin())     # Works
```

### I — Interface Segregation (Small, Focused Interfaces)

```python
# BAD - Forces everything to implement everything
class Animal:
    def fly(self): pass
    def swim(self): pass
    def walk(self): pass

# GOOD - Split into what each animal actually does
class Flyable:
    def fly(self): pass

class Swimmable:
    def swim(self): pass

class Bird(Flyable):
    def fly(self): return "Flying"

class Fish(Swimmable):  
    def swim(self): return "Swimming"
```

### D — Dependency Inversion (Don't Hardcode Dependencies)

```python
# BAD - Hardcoded to specific email service
class UserService:
    def __init__(self):
        self.email = GmailService()  # Stuck with Gmail

# GOOD - Can use any email service
class UserService:
    def __init__(self, email_service):
        self.email = email_service  # Any email service works

# Use it
gmail = GmailService()
service = UserService(gmail)

# Or switch to something else
sendgrid = SendGridService()
service = UserService(sendgrid)
```

## Why This Actually Matters

Your code works and you can actually understand it later which is the most important thing.

**Long term:**
- Adding new features doesn't break old ones
- Testing is actually possible
- Other developers can work with your code
- You spend time building, not debugging 5+ hours that was written in 10 minutes

Once you do this a few times, it starts suggesting clean solutions automatically. It learns your style. Which is a good thing.

I'll be writing about Spec-Driven Development soon. Stay tuned.

The best developers treat AI like a junior teammate who needs clear guidance. Give it structure, and it'll give you quality code.

Thanks for reading!
