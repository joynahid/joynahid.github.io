---
title: "I Changed my thinking about the way I write code"
slug: i-changed-my-thinking-about-the-way-i-write-code
description: In this post, I'll discuss how I changed my thinking about the way I write code.
tags: ["python", "requests", "urllib", "socket", "icanhazip"]
pubDate: "2025-05-03"
---

So I've been writing code for a while now and I've learned a lot of things. I've also learned a lot of things I don't know.

I've realized that there's no right or wrong way to write code. It's all about the problem you're trying to solve. If the piece of code you're writing works for the problem and you're happy with it, then it's good.

I entered into the software development field by python. I've been using python for a while now and I've learned a lot of things about the language. It has rich ecosystem of OOP, functional, and meta programming capabilities. When we start coding python, we write simple script like code snippets. More like a procedural way of writing code.

For example, if we want to download a file from the internet, and transcribe it to text, we will simply write a script like this:

```python
import requests
import os

def download_file(url, output_path):
    response = requests.get(url)
    with open(output_path, 'wb') as file:
        file.write(response.content)

def transcribe_file(file_path):
    with open(file_path, 'r') as file:
        return file.read()

def main():
    url = 'https://example.com/file.txt'
    output_path = 'file.txt'
    download_file(url, output_path)
    transcribed_text = transcribe_file(output_path)
    print(transcribed_text)

if __name__ == '__main__':
    main()
```

This is fine for a simple script. But what if we want to build it into a larger project? Think about in future the transcriber might be changed, there might be more than just a file type of input. We will need to think hard and smartly to code it in a way that is easy to maintain and extend and prevent breaking changes when things are changed.

When I used to write code, I used to think how db models have to be written, what parameters have to be stored in the db, what kind of data is required, what kind of data is optional, etc. Then I used to think about the logic of the code and how to write it in a way that is easy to understand and maintain.

Thinking like this from top down is not a bad thing. It's the fastest way to write code and see quick results. But in the long run this either has to be rewritten/refactored or the code becomes a mess and gets unwanted production bugs/errors. Makes the code much less reliable.

In my job, I've seen this happen a lot. The project I was working on, the code had a very tight coupling between everything, and it was really hard to test and modify anything without breaking the whole system. I had no choice but to implement the code around the existing system.

That was a great experience for me to learn about the backend system and how the whole system was working. Knowing about the system and business helps you decouple the code and dependencies.

In larger system, we have a lot of 3rd party services and dependencies, and they frequently change. We can't control them. We have to adapt to the changes and make our code flexible and reliable.

When we learn coding, specifally web development, we learn about CRUD operations, which makes us feel everything is about the db. In years of experience, I've learned that it's not about the db. It's about the problem we're trying to solve.

We should think about the problem we're trying to solve and how to solve it in a way that is easy to understand and maintain. Not the db models or the CRUD operations from procedural perspective.

There're well defined ways to solve this kind of archietectural problems. We can use SOLID principles, DRY principle, KISS principle, YAGNI principle, etc. But it takes time to learn and apply them as a beginner.

When coding something, I think the best thing to do is to think and write the entities and interfaces first. For example, if we want to build that transcriber, the very first code I'll write is the entities and interfaces.


Firs thing, what will we do? we will transcribe an audio from a URL.

What are the entities in this problem?
- Transcriber
- Audio
- Transcription


Now, let's design our program.


```python
class Audio:
    """
    The Audio that we will transcribe.
    """
    pass

class Transcriber:
    """
    The Transcriber that will transcribe a audio.
    """
    pass

class Transcription:
    """
    The Transcription that will be returned by the transcriber.
    """
    pass
```

We got our entities, now let's define their properties and methods.

```python
from abc import ABC, abstractmethod

class Transcriber(ABC):
    """
    The Transcriber that will transcribe a audio.
    """

    @abstractmethod
    def transcribe(self, audio: Audio) -> Transcription:
        pass
```

Now all our interfaces and required entities are defined. We can use them to build our program. Anybody can code around these entities and interfaces and implement their own version of the transcriber or audio or the transcription.

Many will say that this is OOP way of writing code. I don't think so. The OOP we learn in school says about encapsulation, inheritance, and polymorphism. But I think the OOP isn't just about that. You can also think them as nodes of a graph that communicates with each other using messages. As uncle bob says.
