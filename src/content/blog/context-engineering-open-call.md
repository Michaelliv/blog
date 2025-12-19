---
title: "Context Engineering Has No Engine"
description: "A specification for what context engineering actually means - and a call to build it"
pubDate: 2025-12-19
---

"Context engineering" is having a moment. Everyone's talking about what context to feed their agents. Almost no one is talking about the *engineering* part.

We obsess over which documents to retrieve, which examples to include, which instructions to prepend. But the mechanics of injection? Duct tape. Strings concatenated to system prompts. Tool results appended and forgotten. Context management that doesn't manage anything.

The discipline needs definition. Everyone says "context engineering" but nobody specifies what that actually means. Here's what I think it is.

## The Shape of Every Conversation

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

Every conversation has this shape. Frameworks define how the tool loop works - calling, parsing, error handling. But context injection points? Undefined. How is the system message rendered? Can you inject context into user messages? Into tool responses? Between calls?

Nobody specifies this. Some developers discover it, then hack something together.

Here's what a proper specification would include:

## Renderable Context Components

Tools serve two consumers: UIs and models. UIs want structured JSON. Models want whatever format aids comprehension - markdown tables, XML tags, prose. Today these are conflated.

A tool output protocol separates them:

```
┌─────────────────────────────────────────┐
│ Protocol Version                        │
├─────────────────────────────────────────┤
│ Structured Data (JSON)                  │  → for UIs, logging, debugging
├─────────────────────────────────────────┤
│ Model Rendering                         │  → format optimized for LLM
├─────────────────────────────────────────┤
│ System Reminders                        │  → context to inject with result
└─────────────────────────────────────────┘
```

Some frameworks already feel toward this. Vercel's AI SDK has `toModelOutput` - a function that converts tool results to model-friendly format. But it's a one-off. There's no protocol, no standard way to attach reminders, no composability.

Renderable context components formalize this. The tool returns structured data. A renderer converts it to model format. Reminders attach as metadata. Components compose - a `<CodeContext>` contains `<File>` components, each containing `<Function>` components. Same data, multiple renderings.

## Queryable Conversations

Treat conversation history as an event stream. Every interaction is an event: messages, tool calls, results, failures. Append-only, immutable.

The power is in the views. Materialized projections over the stream that answer questions: What tools have failed, and how many times? What has the model already tried? What entities have been mentioned? Is the model stuck in a loop?

Views are derived from the stream, can be rebuilt anytime, and replace scattered imperative bookkeeping with declarative queries.

## Reactive Injection

Given queryable conversations, we can define rules that trigger context injection. Two flavors:

**State-based**: Rules that fire when conversation state matches a condition - consecutive failures, topic shift, context window pressure. "You've tried this approach twice. Consider an alternative."

**Tool-bound**: Rules attached to tools that fire with tool results. The `write_file` tool carries a reminder to validate paths. Only surfaces when that tool is called.

## Injection Queue

Reminders accumulate between injection points. A queue manages them: prioritization, batching, deduplication. When an injection point arrives, the queue flushes strategically. High-priority safety reminders first. Contextual hints batched together. The queue is the traffic controller.

## Hookable Architecture

Plugin system for everything. Custom rule definitions? Hook. Custom rendering? Hook. Custom injection strategy? Hook. The core provides primitives, not opinions. Developers implement their own interaction patterns through hooks.

---

## The Engine

The engine sits alongside agent execution, not inside it. Middleware that observes the conversation stream, maintains state, and injects context at boundaries. Framework-agnostic. It doesn't care if you're using LangChain, CrewAI, Claude's tool use, or raw API calls.

```
┌─────────────────────────────────────────────────────────┐
│                    Agent Framework                      │
└─────────────────────┬───────────────────────────────────┘
                      │ conversation messages
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   context-engine                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │  Event   │→ │   Rule   │→ │  Queue   │→ │Renderer │  │
│  │  Store   │  │  Engine  │  │ Manager  │  │         │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │ enriched context
                      ▼
┌─────────────────────────────────────────────────────────┐
│                      LLM API                            │
└─────────────────────────────────────────────────────────┘
```

The processing model is unified: rule engine, context accumulation, injection. Whether you're injecting based on a user message keyword or a tool failure pattern, the machinery is the same.

---

If this resonates, I'm building it: [github.com/Michaelliv/context-engine](https://github.com/Michaelliv/context-engine). Star it, open an issue, or tell me why I'm wrong.
