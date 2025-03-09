---
title: "Mastering Prompting in LangChain for 2025: Prompt Templates"
slug: mastering-prompting-in-langchain-for-2025-prompt-templates
description: "Mastering Prompting in LangChain for 2025: Prompt Templates"
tags: ["python", "langchain", "prompting", "llm", "ai"]
pubDate: "2025-03-09"
heroImage: '/assets/mastering-prompting-in-langchain-for-2025-prompt-templates/cover.png'
---


![Cover](/assets/mastering-prompting-in-langchain-for-2025-prompt-templates/cover.png)


This year, many developers are diving into AI Engineering, drawn by its growing hype in 2025 - and I'm one of them. Whenever I search for insights, one library keeps popping up: LangChain. Scrolling through Upwork, I often see job listings mentioning LangChain, LangGraph, and more. Intrigued, I sat back, watched some YouTube tutorials, and started exploring. My first impression was: 'Aren't these just wrappers around LLMs and text-processing meta-libraries?' But I quickly realized LangChain offers much more - it's a powerful ecosystem, streamlined by its 'LCEL' (LangChain Expression Language), a clever way to prompt LLMs through structured chains of prompts.


The chain basically works like this from a top-level view:

![An Example Chain of Prompts and Task](/assets/mastering-prompting-in-langchain-for-2025-prompt-templates/chain.png)


See how it's doing that chain of prompting and processing? LangChain's LCEL helps doing this easily.

In this article, we're going to explore different types of prompting techniques that can be implemented using LangChain's prompts tool. Later these prompts will be used to form chain.

## Prompting Templates in LangChain
```python
from langchain.prompts import (
    PromptTemplate,              # Basic template for creating prompts with placeholders for variables
    ChatPromptTemplate,          # Template specifically designed for chat-based interactions
    FewShotPromptTemplate,       # Template for few-shot learning with static examples
    PipelinePromptTemplate,      # Template for chaining multiple prompts in a sequence
)
```

LangChain offers various tools for creating and managing prompts. The core tool is PromptTemplate, which is sufficient for most tasks. Other tools, like ChatPromptTemplate or FewShotPromptTemplate, focus on organizing and structuring prompts in a cleaner, more maintainable way. However, all these functionality can be replicated with PromptTemplate. Let's explore some prompting techniques.

### Zero Shot Prompting

```python
from langchain.prompts import PromptTemplate

bd_capital_prompt = PromptTemplate.from_template("What's the capital of Bangladesh?")
```

### One Shot Prompting
```python
from langchain.prompts import PromptTemplate

one_shot_capital_prompt = PromptTemplate.from_template("""
Input: What's the capital of Bangladesh?
Answer: Dhaka

Input: What's the capital of England?
Answer: 
""")
```

### Few Shot Prompting
```python
from langchain.prompts import PromptTemplate

few_shot_sentiment_prompt = PromptTemplate.from_template("""
Input: I absolutely loved the movie! The acting was superb and the storyline was captivating.
Answer: Positive

Input: The service at the restaurant was terrible, and the food was cold.
Answer: Negative

Input: The book was okay, nothing extraordinary but not bad either.
Answer: Neutral

Input: This new phone has amazing features, and the battery life is incredible!
Answer: Positive

Input: The weather today is rainy, which makes it hard to go outside.
Answer: Negative

Input: The meeting was rescheduled to next week, so we have more time to prepare.
Answer: 
""")
```

So far, these prompting techniques have been static, meaning they don't adapt to new inputs. To make them dynamic, we can use placeholders that allow data to be inserted on the fly, much like Python's string formatting.
```
"Input: {user_input}".format(user_input="This burger wasn't tasty and overpriced")
```
In PromptTemplate, this will be:
```
prompt = PromptTemplate.from_template("Input: {user_input}")
prompt.invoke({"user_input": "This burger wasn't tasty and overpriced"})
```
PromptTemplate gives us a nice interface to write more complex prompt in LangChain. The following examples can be made dynamic using different placeholders in different places.

### Chain-of-Thought (CoT) Prompting
Chain-of-Thought prompting encourages the model to "think" step-by-step before arriving at an answer, which is particularly useful for complex reasoning tasks like math, logic, or multi-step decision-making. This is such a powerful way of prompt to do solve complex problem. 

Example: Solving a Math Problem

```python
from langchain.prompts import PromptTemplate

cot_math_prompt = PromptTemplate.from_template("""
To solve a problem, break it down into steps and explain your reasoning clearly.

Problem: If a shirt costs $20 and is on sale for 25% off, what is the final price?
Reasoning:
1. First, calculate the discount amount: 25% of $20 = 0.25 * 20 = $5.
2. Subtract the discount from the original price: $20 - $5 = $15.
3. The final price is $15.
Answer: $15

Problem: If a book costs $50 and is on sale for 40% off, what is the final price?
Reasoning:
1. First, calculate the discount amount: 40% of $50 = 0.40 * 50 = $20.
2. Subtract the discount from the original price: $50 - $20 = $30.
3. The final price is $30.
Answer: $30

Problem: If a laptop costs $800 and is on sale for 15% off, what is the final price?
Reasoning:
""")
```

### Role Based Prompting

Role-based prompting involves assigning the model a specific role or persona (e.g., a teacher, a lawyer, a chef) to guide its responses in a contextually appropriate way.

Example: Acting as a Travel Guide

```python
role_based_travel_prompt = PromptTemplate.from_template("""
You are an expert travel guide with extensive knowledge of tourist destinations. Provide a detailed and enthusiastic recommendation for a visitor.

Question: What should I do if I visit Paris for the first time?
Response: Oh, Paris-what a magical destination! Start your journey at the iconic Eiffel Tower; climb or take the elevator to the top for a breathtaking view of the city. Then, stroll along the Champs-Élysées to the Arc de Triomphe, where you can admire the architecture and history. Don't miss the Louvre Museum, home to the Mona Lisa and countless masterpieces-book tickets in advance to skip the lines! For a taste of Parisian culture, enjoy a coffee and croissant at a charming café in Montmartre, and end your day with a serene boat ride along the Seine River. Paris is a city of romance, art, and history-every corner has a story to tell!

Question: What should I do if I visit Tokyo for the first time?
Response: 
""")
```

### Instruction-Based Prompting

Instruction-based prompting provides detailed and explicit instructions to guide the model's behavior, often without examples. This is similar to zero-shot but focuses on clarity and specificity in the task description.

Example: Writing a Formal Email

```python
from langchain.prompts import PromptTemplate

instruction_based_email_prompt = PromptTemplate.from_template("""
Write a formal email following these instructions:
1. Use a professional greeting (e.g., "Dear [Name]").
2. Clearly state the purpose of the email in the first paragraph.
3. Provide relevant details in the second paragraph, using bullet points if necessary.
4. End with a polite closing (e.g., "Sincerely, [Your Name]").
5. Ensure the tone is formal and respectful.

Task: Write an email to request a meeting with a potential client named Mr. John Smith to discuss a new product launch.

Email:
""")
```

### Contrastive Prompting

Contrastive prompting involves showing the model examples of both correct and incorrect responses (or positive and negative examples) to help it distinguish between good and bad outputs.

Example: Identifying Fake News

```python
from langchain.prompts import PromptTemplate

contrastive_fake_news_prompt = PromptTemplate.from_template("""
Your task is to determine whether a news headline is likely to be real or fake. Below are examples of real and fake headlines to guide your decision.

Example 1:
Headline: "Scientists Discover New Species of Fish in Pacific Ocean"
Label: Real
Reasoning: The headline is specific, references a credible topic (scientific discovery), and avoids sensational language.

Example 2:
Headline: "Aliens Invade Florida, Government Hides Evidence!"
Label: Fake
Reasoning: The headline uses sensational language, makes extraordinary claims without evidence, and lacks credible sources.

Example 3:
Headline: "Local Mayor Announces New Park Opening Next Month"
Label: Real
Reasoning: The headline is specific, local, and focuses on a plausible event without exaggeration.

Example 4:
Headline: "Man Claims Drinking Bleach Cures All Diseases!"
Label: Fake
Reasoning: The headline promotes dangerous misinformation, lacks credible sources, and uses sensational language.

Now, analyze the following headline:
Headline: "New Study Shows Drinking Coffee Extends Life by 10 Years"
Label: 
""")
```

Prompting is all about being creative, doing trial and error, observing how model is reacting to certain prompts and tweaking them for the best possible outcome.

### PipelinePromptTemplate

In LangChain, one way to construct prompts is through the PipelinePromptTemplate. This approach allows you to create a sequence of prompt templates, where each template can build upon or incorporate the output of the previous one, effectively forming a 'pipeline' of prompts. This pipe-like structure enables a modular and organized flow of information, making it easier to manage complex prompting workflows by chaining multiple steps together.

![PipelinePromptTemplate](/assets/mastering-prompting-in-langchain-for-2025-prompt-templates/pipelineprompt.png)



```python
# Step 1: Extract the user's name
name_extraction_prompt = PromptTemplate.from_template("""
Extract the user's name from the input.
""")

# Step 2: Generate a greeting message
greeting_generation_prompt = PromptTemplate.from_template("""
Generate a greeting message for the user {extracted_name}.
""")

# Step 3: Add a friendly closing
closing_prompt = PromptTemplate.from_template("""
Add a friendly closing to the greeting {generated_greeting}.
""")

pipeline_prompt = PipelinePromptTemplate(
    final_prompt=closing_prompt,
    pipeline_prompts=[
        ("name_extraction", name_extraction_prompt),
        ("greeting_generation", greeting_generation_prompt),
    ]
)
```

This differs from LangChain's 'Chain' or LCEL, as it focuses solely on enabling a sequential flow of prompts, where each prompt carries forward the context of its predecessors, forming a pipeline-like structure. In contrast, LangChain's Chain is more robust, offering greater flexibility and the ability to achieve similar prompting behaviors, among other advanced functionalities.

In my upcoming posts, I plan to discuss how we can make beautiful chains using these prompts and solve real world tasks.
