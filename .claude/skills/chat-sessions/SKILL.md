---
name: chat-sessions
description: How to embed Claude Code chat sessions in blog posts. Use when Michael wants to include session snippets in a post.
---

# Embedding Claude Code Sessions

This skill explains how to render Claude Code chat sessions in blog posts using the `ChatSession` component.

## Component Location

- **Parser:** `src/utils/parseSession.ts`
- **Component:** `src/components/ChatSession.astro`

## Three Input Formats

The component accepts three formats for the `session` prop:

### 1. Typed Array (Recommended for authoring)

Cleanest for writing sessions inline. No escaping needed.

```mdx
import ChatSession from '../../components/ChatSession.astro';

<ChatSession session={[
  { role: "user", content: "hello" },
  { role: "assistant", content: "Hi there!", tools: [{ name: "Read", input: { file_path: "foo.ts" } }] },
  { role: "assistant", content: "Here's what I found..." }
]} />
```

**SimpleMessage format:**
```ts
{
  role: 'user' | 'assistant';
  content: string;           // The message text
  tools?: Array<{            // Optional tool calls (assistant only)
    name: string;
    input?: Record<string, unknown>;
  }>;
}
```

### 2. Imported JSONL File

For curated snippets stored in files.

```mdx
import ChatSession from '../../components/ChatSession.astro';
import session from '../../assets/sessions/my-session.jsonl?raw';

<ChatSession session={session} />
```

### 3. Inline JSONL String

For raw session data.

```mdx
<ChatSession session={`
{"type":"user","uuid":"1","message":{"role":"user","content":"hello"}}
{"type":"assistant","uuid":"2","message":{"role":"assistant","content":[{"type":"text","text":"Hi!"}]}}
`} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `session` | string \| SimpleMessage[] \| ChatMessage[] | required | Session data in any format |
| `showThinking` | boolean | false | Show extended thinking blocks |
| `fromUuid` | string | - | Start from this message UUID |
| `toUuid` | string | - | End at this message UUID |
| `limit` | number | - | Limit number of messages |

## Finding Real Sessions

Claude Code stores sessions at:
```
~/.claude/projects/{project-path-with-dashes}/{session-uuid}.jsonl
```

Example:
```
~/.claude/projects/-Users-michaelliv-Projects-blog/b33b47ac-fab7-4047-98de-39a893da2987.jsonl
```

## Visual Output

The component renders:
- `>` green prompt for user input
- `⏺` blue bullet for assistant actions
- Tool calls as `ToolName(param: "value")`
- `⎿` for tool output hints
- Dark terminal background (#1a1a1a)

## Example Post

See `src/content/blog/embedding-claude-code-sessions.mdx` for a complete example.
