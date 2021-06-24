---
layout: page
permalink: /cp-career
---

<h1>Nahid's Competitive Programming Career</h1>

## Table of Contents
- [Online Judge Appearances](#online-judge-appearances)
- [Competitive Participation](#competitive-participation)
- [Problem Setting](#problem-setting)

# Online Judge Appearances
I started competitive programming from the very first time of my University life. I enjoy doing it pretty much. So far I managed to solve many questions from various online judges to sharpen my **logical** and **mathematical** skills.

{% include cp_appearances.html %}

# Competitive Participation


<table class="cp-career" border="1">
    <tr>
      <th>Participation</th>
      <th>Team</th>
      <th>Rank</th>
    </tr>

    {% for participation in site.data.cp_career.participations %}
    <tr>
      <td>{{participation.name}}</td>
      <td>{{participation.team}}</td>
      <td>{{participation.rank}}</td>
    </tr>
    {% endfor %}
</table>

# Problem Setting
<table class="cp-career" border="1">
    <tr>
      <th>Title</th>
      <th>Category</th>
      <th>Contest</th>
    </tr>

    {% for problem in site.data.cp_career.set_problems %}
    <tr>
      <td title="{{problem.title}}">{{problem.title}}</td>
      <td>{{problem.category}}</td>
      <td title="{{problem.contest}}">{{problem.contest}}</td>
    </tr>
    {% endfor %}
</table>