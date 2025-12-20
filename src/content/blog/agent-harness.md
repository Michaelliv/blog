---
title: "The Agent Harness"
description: "Defining the behaviors that LLM frameworks leave undefined"
pubDate: 2025-12-20
---

Yesterday I wrote about [context engineering needing an engine](/blog/context-engineering-open-call). The feedback was clear: the framing didn't land. "Context engineering" is too abstract. People nodded politely and moved on.

Let me try again with a different frame: **the agent harness**.

## What Frameworks Don't Define

Every agent framework gives you the same thing: a loop. Call the model, parse tool calls, execute tools, feed results back, repeat. LangChain, CrewAI, Vercel AI SDK, raw API calls - they all nail this part.

But here's what they leave undefined:

- **When does the agent stop?** Frameworks offer `maxSteps` and `stopConditions`, but they're isolated from conversation state. Stopping based on what's been tried, what's failed, what's accumulated? Glue code.
- **What context gets injected where?** System message, user message, tool response - all valid injection points. No standard approach.
- **How do tool outputs render?** UIs want JSON. Models want markdown or XML or prose. Your problem.
- **How do you enforce tool behaviors?** "Always read before edit." "Confirm before delete." "Compact context when it gets long." Roll your own.
- **How do you remind the model of constraints?** Inject into every message? Only on certain triggers? Hope it remembers?

These aren't edge cases. They're the difference between an agent that works and one that spirals.

## Injection Points

Every conversation has the same shape:

```
┌─────────────────────────────────────────────────────────┐
│ SYSTEM MESSAGE                                          │ ← injection point
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ USER MESSAGE                                            │ ← injection point
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ ASSISTANT                                               │
│   ┌───────────────────────────────────────────────────┐ │
│   │ Tool Call                                         │ │
│   └───────────────────────────────────────────────────┘ │
│   ┌───────────────────────────────────────────────────┐ │
│   │ Tool Response                                     │ │ ← injection point
│   └───────────────────────────────────────────────────┘ │
│   ... more calls ...                                    │
│   Final response                                        │
└─────────────────────────────────────────────────────────┘
```

These are the places where you can inject context. Frameworks define how messages flow. The harness defines what gets injected at each point, when, and why.

## The Harness

Seven behaviors that need definition:

### 1. Tool Output Protocol

Tools serve two consumers: UIs and models. UIs want structured JSON for rendering. Models want whatever format aids comprehension.

```
┌─────────────────────────────────────────┐
│ Structured Data (JSON)                  │  → for UIs, logging, debugging
├─────────────────────────────────────────┤
│ Model Rendering                         │  → format optimized for LLM
├─────────────────────────────────────────┤
│ Attached Reminders                      │  → context to inject with result
└─────────────────────────────────────────┘
```

One tool output, multiple renderings. The protocol defines how they're bundled.

### 2. Conversation State

Treat conversation history as queryable state. Not just a list of messages - an event stream with views.

- How many times has this tool failed?
- What has the model already tried?
- How much context has accumulated?
- Is the model stuck in a loop?

Views over the stream, not scattered bookkeeping.

### 3. System Reminders

Context that gets injected at injection points. Three levels:

**System-level**: Seed the system message with awareness that reminders exist. Include a few-shot example so the model knows the format and pays attention. "You will receive `<system-reminder>` tags with context. Here's an example..."

**Message-level**: Reminders that attach to user messages or tool responses. "Remember to validate file paths." "You have 3 tools available for this task."

**Tool-level**: Reminders bound to specific tools. When `write_file` is called, inject "never import in the middle of a file." Only surfaces when relevant.

### 4. Stop Conditions

When does the agent stop? Define it explicitly:

- **Turn limit**: Stop after N turns
- **Token budget**: Stop when context exceeds threshold
- **Task completion**: Stop when a condition is met (model says done, specific output detected)
- **Error threshold**: Stop after N consecutive failures
- **Custom rules**: Any condition over conversation state

Without explicit stop conditions, agents run until they hit API limits or spiral into nonsense.

### 5. Tool Enforcement Rules

Rules that govern tool behavior:

- **Sequencing**: "Always read a file before editing it"
- **Confirmation**: "Confirm with user before deleting files"
- **Rate limiting**: "Max 3 retries per tool per turn"
- **Auto-actions**: "When context exceeds 80%, trigger compaction"

These aren't suggestions to the model. They're enforced by the harness.

### 6. Injection Queue

Reminders accumulate. A queue manages them:

- Prioritization (safety reminders first)
- Batching (group related context)
- Deduplication (don't repeat yourself)

When an injection point arrives, the queue flushes strategically.

### 7. Hooks

Plugin system for everything. Custom stop conditions? Hook. Custom rendering? Hook. Custom injection logic? Hook.

The harness provides structure. Hooks provide flexibility.

---

## Why "Harness"

A harness guides without replacing. It wraps the agent loop, observes the conversation, enforces rules, injects context. The agent still does the work. The harness keeps it on track.

```
┌─────────────────────────────────────────────────────────┐
│                    Agent Framework                      │
└─────────────────────┬───────────────────────────────────┘
                      │ conversation
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    Agent Harness                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │  State   │→ │  Rules   │→ │  Queue   │→ │Renderer │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │ enriched context
                      ▼
┌─────────────────────────────────────────────────────────┐
│                      LLM API                            │
└─────────────────────────────────────────────────────────┘
```

The goal: framework-agnostic. Should work with LangChain, CrewAI, Vercel AI SDK, or raw API calls.

---

I'm building this. The spec is at [github.com/Michaelliv/agent-harness](https://github.com/Michaelliv/agent-harness). An AI SDK implementation is underway at [github.com/Michaelliv/agent-harness-ai-sdk](https://github.com/Michaelliv/agent-harness-ai-sdk).

Star it, open an issue, or tell me why I'm wrong.
