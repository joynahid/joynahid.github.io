---
title: How I Optimized Millions of Strings, Sluggish Searches
slug: how-i-optimized-millions-of-strings-sluggish-searches
description: A few weeks ago, I was assigned to address a performance bottleneck in our system. We had a database with millions of text entries—imagine product title averaging around 500 characters. The issue? Search queries were taking far too long, sometimes over ten seconds just to retrieve relevant items.
tags: ["search", "optimization", "performance", "algorithms"]
pubDate: 2025-01-06
---


A few weeks ago, I was assigned to address a performance bottleneck in our system. We had a database with millions of text entries—imagine product title averaging around 500 characters. The issue? Search queries were taking far too long, sometimes over ten seconds just to retrieve relevant items.

Our goal was clear: **speed up** substring searches and pattern matching so users get near-instant results. The patterns include:
- Exact matches
- Asterisk matches where `*` (asterisk) can be anywhere in the search query. eg.
  - `qu*er*`
  - `*ffix`
  - `suff*`

In the beginning, the naive approach was to run simple substring searches on each record, but with millions of entries, that approach scaled poorly and too slow to make simple search queries.

As a former [competitive programmer](https://en.wikipedia.org/wiki/Competitive_programming), I was already familiar with efficient string-search techniques. For example, the sliding window approach (Rabin-Karp) lets you check matches at specific positions in constant time, and using a Trie for prefix searches runs in **O(N+Q)**, where *Q* is the prefix length and *N* is the text length.
By leveraging these methods, I significantly sped up our queries. For more complex searches, **Elasticsearch** can be a great choice, since it provides many options to accelerate text-based queries. However, our use case wasn’t overly complex, and I saw no need to introduce an extra technology when our existing system could handle these searches well enough.

In short, I did some analysis on the following list of techniques/algorithms:
1. **Naive Substring Search**
2. **Hashing (Rabin-Karp)**
3. **MongoDB’s Regex Search**
4. **Aho-Corasick**
5. **Prefix/Suffix Search**
6. **Trie Data Structure**
7. **Caching**

Let’s explore each of these in detail.

### 1. Naive Substring Search: The Starting Point
**The naive method** is often our first approach:
1. Iterate through each string in the dataset.
2. For each string, check if our **search term** is a substring.

In **Python**, something like:
```python
def naive_search(data_list, query):
	results = []
    for text in data_list:
		if query in text:  # naive substring 
			results.append(text)
	return results
```
#### **Time complexity**: O(N × M) in the worst case, where:
* N = total length of the text
* M = length of the pattern (search term)

For a small dataset, this might be enough. But at **millions of records**, it’s too slow. This approach exposed our biggest problem: **linear scans** on a huge dataset took far too long.

### 2. Hashing Approach
When dealing with large text processing, the **Hashing String** can be a game-changer. It uses **string hashing** to quickly check if a substring might match before doing a more precise comparison. Here’s the simplified idea:
1. Compute a **hash value** for the search term (pattern).
2. Slide over the text and compute hashes for each substring of the same length.
3. If a hash matches, do a deeper check to confirm.

**Key Advantage**:
* When implemented well, Rabin-Karp can perform near O(N + M) in average cases, making it faster for large-scale searches than the naive approach.

**Potential Pitfall**:
* **Hash collisions** can force more comparisons. But with a good hashing function (like polynomial rolling hash), collisions are minimized.

**Note**: I used a slightly modified version of this for searching prefix and suffix matches.
- I calculated all possible trigrams and calculated the hash of it using polynomial rolling hash function (Doubled it to reduce collisions)
- Keep all the integer hashes in the database and index those integers for each row
- When searching calculate the hash of the query and find for matches
- Post verify the matches to filter out collided strings (extra check for reliability)

### 3. MongoDB’s Regex Search
I decided to try out MongoDB’s **regular expression** searching for searching (asterisk) patterns as this was the easiest way to go with. For example:

```mongodb
db.myCollection.find({
    "description": { "$regex": "somep*tt*rn", "$options": "i" }
})
```
### 
* `"$options"`: `"i"` means **case-insensitive** search.

MongoDB’s internal engine can handle large data sets relatively efficiently. It also supports indexing on certain types of patterns, though it’s limited compared to full-text search engines. If your data is already in MongoDB and you rely on flexible queries, **regex** can be an **easy** approach—though not always the fastest for **complex** scenarios. But surprisingly this worked well on some of our test datasets. It was giving results in less than 3 seconds which was acceptable for pattern matching with asterisks.

### 4. Caching to the Rescue
Yes. “JUST CACHE IT” worked! I used a basic cache for the search queries and applied simple invalidation logic whenever something updates. Caching can be done in many ways and can be optimized to store frequently accessed data. In this case, I used **Redis** for caching.

**Benefits**
* **Instant Retrieval**: Subsequent queries for the same pattern are served from the cache.
* **Reduced Load**: You don’t repeatedly hammer your database or re-run your entire search algorithm.


### Other Ways Explored
1. **Aho-Corasick**: Multiple Pattern Matching on Steroids
2. **Trie (Prefix Tree)**: Efficient Prefix Search

### Tools Used
#### Profiling & Basic Fixes
We realized naive substring searches were crushing performance. So, we decided to **profile** queries. Found that certain queries appeared repeatedly, so **caching** gave us an immediate speed boost for those repetitive searches.

#### String hashing & Regex Trials
* For on-the-fly single-pattern searches, **Rabin-Karp** gave us better performance than naive scanning when we needed to handle less uniform data.
* Since part of our data lived in **MongoDB**, we tested **regex** queries directly there, which worked decently but wasn’t always the fastest for arbitrary substring matching.

⠀
### Lessons
#### Know Your Patterns
* Before you start optimizing your search, analyze your dataset to identify any key patterns that can help improve search or sorting. Chances are you’ll find something useful. For example:
  * If your data contains only Latin characters, consider using a bitmask to quickly check if a string exists. Analyze if it helps to solve your specific task.
  * If you need to check whether a single word exists in a huge list of data, consider using a probabilistic existence checker way, like [Bloom filter](https://redis.io/docs/latest/develop/data-types/probabilistic/bloom-filter/).

#### Does Caching Help?
* If your searches tend to repeat, store them in **Redis** (or another in-memory cache). This simple approach can solve many performance bottlenecks.

#### MongoDB’s Regex Is Convenient But Not Always Optimal
* For smaller datasets or partial text indexing, MongoDB’s regex can be surprisingly effective. However, if you’re doing heavy substring searches across millions of large strings, specialized string-search algorithms or indexing structures are often faster.

#### Data Structures Matter
* **Tries**, **suffix arrays**, and **suffix trees** can significantly reduce lookup times, but they also require substantial memory. Weigh your memory constraints before committing to these structures.

#### Avoid One-Size-Fits-All
* Real-world systems often need a combination of techniques. For instance, you might combine hashing and regex, or use even more advanced algorithms, depending on the use case.

#### Don’t Forget About Indexes
* Carefully plan your database structure and index keys or columns to enable faster lookups. Proper indexing can dramatically speed up queries.

#### Complexity & Maintenance
* Remember that maintaining advanced data structures (like Aho-Corasick or complex tries) can be difficult if your data updates frequently. Always compare the maintenance costs to the performance gains.


### Final Words
Optimizing searches over **millions of strings** can be an intimidating challenge, but it’s also an exciting opportunity to explore a rich toolbox of algorithms and data structures. From **naive substring** checks to **Rabin-Karp** hashing, from **MongoDB’s regex** to advanced **Aho-Corasick** pattern matching, and from **prefix/suffix** searches to building a **Trie**, each approach has its sweet spot.
* If you face repeated queries, **caching** might be the simplest, biggest win.
* If you handle large-scale logs with multiple search terms, **Aho-Corasick** is unrivaled.
* For “starts with” queries, **Tries** or specialized prefix indexes can drastically speed up lookups.

In my project, combining these techniques led to a balanced, **high-performance** search solution that now handles **millions** of strings in near real-time—making our users, and my team, extremely happy.
