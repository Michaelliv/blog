---
title: 'Anatomy of agentic systems'
description: 'The basic ingredients of an agentic system and the pulls and levers we have to control behavior.'
pubDate: 2025-11-28T14:00:00
tags: ['llms', 'agents']
---

I'll be writing a lot about LLMs and agentic systems here. Before diving into the weeds, it's worth laying out the basic anatomy.

## The ingredients

An agentic system has a few core components:

**The LLM.** The reasoning engine. It takes context in, produces actions or text out. It doesn't remember anything between calls - every invocation starts fresh.

**The loop.** The agent runs in a loop: observe, think, act, repeat. The loop is what makes it "agentic" rather than just a single prompt-response.

**Tools.** Functions the agent can call to affect the world - read files, make API calls, run code. Without tools, the agent can only talk.

**Context window.** Everything the model can see at once. This is your working memory. It fills up fast.

**System prompt.** The instructions that shape behavior. This is where you define who the agent is and how it should act.

That's it. Everything else is scaffolding around these five things.

## The pulls and levers

When an agent misbehaves, you have a few places to intervene:

**System prompt.** The most obvious lever. You can add rules, examples, constraints. But there's a catch: instructions compete for attention. The more you add, the less weight each one carries.

**Tool design.** The shape of your tools guides behavior more than you'd think. What you name them, what parameters you expose, what you leave out - these all steer the agent. A well-designed tool makes the right action obvious.

**Context injection.** You can inject information into the conversation at runtime. Reminders, state summaries, retrieved documents. This is how you keep the agent on track as the conversation grows.

**Output parsing.** You can validate and filter what comes out. Reject malformed responses, strip unwanted content, enforce schemas. This is your last line of defense.

**Temperature and sampling.** Lower temperature means more deterministic outputs. Sometimes you want creativity, sometimes you want reliability.

## Stickiness

Here's something that surprises people: LLM behavior is sticky.

Once a pattern establishes itself in a conversation, it tends to persist. If the agent starts being verbose, it stays verbose. If it adopts a particular approach to a problem, it keeps using that approach even when it stops working.

This happens because the model's own outputs become part of its context. It's literally learning from itself, in real-time, within the conversation.

This cuts both ways. Bad patterns stick. But so do good ones. If you can get the agent into a good rhythm early, it tends to stay there.

The first few turns of a conversation matter more than the later ones.

## What this means in practice

Building agentic systems is mostly about managing these dynamics. You're not programming in the traditional sense. You're shaping behavior through constraints and context.

The craft is in knowing which lever to pull when.

More on specific techniques in future posts.
