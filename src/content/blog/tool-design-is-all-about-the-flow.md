---
title: "Tool Design is All About the Flow"
description: "The insight that finally made my agents reliable: tools aren't utilities, they're waypoints."
pubDate: 2025-12-15
tags: ['agents', 'tool-design', 'llms']
---

Your tools aren't capabilities you give the model. They're waypoints that shape how it thinks.

Most agent failures come from too much freedom. You dump context in, ask for output, and hope for the best. The model has to figure out what it needs, retrieve it mentally, reason through it, and produce an answer. All in one shot. That's a lot of [cognitive load](https://github.com/zakirullin/cognitive-load) for a single completion.

The fix isn't just better prompts. It's designing the flow.

Here's a pattern that works: **Search → View → Use**.

**Search** returns summaries: titles, snippets, metadata. Not full content. The model sees candidates but can't access details yet.

**View** loads the full content of something the model explicitly chose. Tokens only enter context when the model decides they're needed.

**Use** commits a piece of information to the output. Use is an explicit decision point—your system can trigger follow-up actions when something gets Used, not just viewed. Some components might require follow-up actions when used. This is where you wire that logic.

This is progressive disclosure for agents. Smaller context means less noise for the model to filter, and explicit retrieval steps create natural checkpoints for reasoning. It works in UX. It works in Claude Code (skills load context only when invoked). And it works for tool design.

This forces the model through a deliberate sequence: discover, inspect, commit. Context stays lean. Reasoning becomes auditable. You can trace exactly what the model looked at and what it decided to use.

A code assistant searches functions, views implementations, then Uses the ones it references. Context stays minimal until needed.

The deeper principle: you're turning a generation problem into a navigation problem. Instead of asking the model to hold everything in its head and produce an answer, you give it a map to traverse. The tools are the terrain. The model's job becomes navigation and assembly, not memorization and inference.

The Search/View/Use pattern is most obvious in retrieval workflows, but the principle extends anywhere you can break "do everything at once" into staged decisions.

This doesn't cure all agent problems. You still need to reinforce the flow in your system message and guardrail against bad behavior. Don't let the model edit a file it hasn't read. Don't let it answer before it searches. The tools create the path, but you need to keep the model on it.

Constrained flow beats open freedom every time.
