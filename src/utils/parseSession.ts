/**
 * Parser for Claude Code session JSONL files
 */

export interface TextBlock {
  type: 'text';
  text: string;
}

export interface ThinkingBlock {
  type: 'thinking';
  thinking: string;
}

export interface ToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResultBlock {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
}

export type ContentBlock = TextBlock | ThinkingBlock | ToolUseBlock | ToolResultBlock;

export interface ChatMessage {
  uuid: string;
  parentUuid: string | null;
  timestamp: string;
  role: 'user' | 'assistant';
  content: ContentBlock[] | string;
}

/**
 * Simplified message format for inline authoring
 */
export interface SimpleMessage {
  role: 'user' | 'assistant';
  content: string;
  tools?: Array<{ name: string; input?: Record<string, unknown> }>;
}

interface RawMessage {
  type: 'user' | 'assistant' | 'file-history-snapshot';
  uuid?: string;
  parentUuid?: string | null;
  timestamp?: string;
  isMeta?: boolean;
  message?: {
    role: 'user' | 'assistant';
    content: ContentBlock[] | string;
  };
}

/**
 * Parse JSONL string into ChatMessages
 */
export function parseSessionJsonl(jsonlContent: string): ChatMessage[] {
  const lines = jsonlContent.trim().split('\n');
  const messages: ChatMessage[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    try {
      const raw: RawMessage = JSON.parse(line);

      // Skip non-message types
      if (raw.type === 'file-history-snapshot') continue;
      if (!raw.message) continue;
      if (raw.isMeta) continue;

      // Skip internal command messages
      if (typeof raw.message.content === 'string') {
        if (raw.message.content.includes('<command-name>')) continue;
        if (raw.message.content.includes('<local-command-stdout>')) continue;
        if (raw.message.content.includes('<system-reminder>')) continue;
      }

      // Skip tool results (they're shown inline with tool_use)
      if (Array.isArray(raw.message.content)) {
        const hasOnlyToolResults = raw.message.content.every(
          (block) => block.type === 'tool_result'
        );
        if (hasOnlyToolResults) continue;

        // Skip messages with only thinking blocks (intermediate streaming)
        const hasOnlyThinking = raw.message.content.every(
          (block) => block.type === 'thinking'
        );
        if (hasOnlyThinking) continue;
      }

      messages.push({
        uuid: raw.uuid || '',
        parentUuid: raw.parentUuid || null,
        timestamp: raw.timestamp || '',
        role: raw.message.role,
        content: raw.message.content,
      });
    } catch {
      // Skip malformed lines
      continue;
    }
  }

  // Deduplicate: keep only the most complete version of each message
  // (Claude streams messages, so we get multiple versions)
  const seen = new Map<string, ChatMessage>();
  for (const msg of messages) {
    const existing = seen.get(msg.uuid);
    if (!existing) {
      seen.set(msg.uuid, msg);
    } else {
      // Keep the one with more content
      const existingLen = JSON.stringify(existing.content).length;
      const currentLen = JSON.stringify(msg.content).length;
      if (currentLen > existingLen) {
        seen.set(msg.uuid, msg);
      }
    }
  }

  return Array.from(seen.values()).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

/**
 * Convert SimpleMessage array to ChatMessage array
 */
export function fromSimpleMessages(messages: SimpleMessage[]): ChatMessage[] {
  return messages.map((msg, i) => {
    const content: ContentBlock[] = [];

    // Add tool calls first
    if (msg.tools) {
      for (const tool of msg.tools) {
        content.push({
          type: 'tool_use',
          id: `tool-${i}-${content.length}`,
          name: tool.name,
          input: tool.input || {},
        });
      }
    }

    // Add text content
    if (msg.content) {
      content.push({
        type: 'text',
        text: msg.content,
      });
    }

    return {
      uuid: `msg-${i}`,
      parentUuid: i > 0 ? `msg-${i - 1}` : null,
      timestamp: new Date().toISOString(),
      role: msg.role,
      content: msg.role === 'user' ? msg.content : content,
    };
  });
}

/**
 * Normalize input to ChatMessage array
 * Accepts: string (JSONL), SimpleMessage[], or ChatMessage[]
 */
export function normalizeSession(
  input: string | SimpleMessage[] | ChatMessage[]
): ChatMessage[] {
  // String input - parse as JSONL
  if (typeof input === 'string') {
    return parseSessionJsonl(input);
  }

  // Array input
  if (Array.isArray(input) && input.length > 0) {
    const first = input[0];

    // Check if it's SimpleMessage format (has 'role' but no 'uuid')
    if ('role' in first && !('uuid' in first)) {
      return fromSimpleMessages(input as SimpleMessage[]);
    }

    // Already ChatMessage format
    return input as ChatMessage[];
  }

  return [];
}

export function extractRange(
  messages: ChatMessage[],
  options?: { fromUuid?: string; toUuid?: string; limit?: number }
): ChatMessage[] {
  let result = messages;

  if (options?.fromUuid) {
    const fromIndex = result.findIndex((m) => m.uuid === options.fromUuid);
    if (fromIndex !== -1) {
      result = result.slice(fromIndex);
    }
  }

  if (options?.toUuid) {
    const toIndex = result.findIndex((m) => m.uuid === options.toUuid);
    if (toIndex !== -1) {
      result = result.slice(0, toIndex + 1);
    }
  }

  if (options?.limit) {
    result = result.slice(0, options.limit);
  }

  return result;
}
