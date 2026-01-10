---
title: "Claude forgot. ran didn't."
description: "Claude Code forgets your bash commands after context resets. ran indexes them across sessions so you can search what worked."
pubDate: 2026-01-10
tags: ["cli", "claude-code", "open-source", "context-engineering"]
---

I don't memorize command flags. I hit `ctrl+r`, type a few characters, and bash finds what I ran before. Reverse-i-search. Muscle memory at this point.

It's not laziness — it's efficient. Why remember `docker build --no-cache --platform linux/amd64 -t` when the shell remembers for me?

Claude Code should have this too.

## The reset problem

When you're doing heavy development with Claude Code, context resets often. Every 45 minutes, maybe an hour. You hit the limit, context compacts, or you start a fresh session because things got messy.

Now Claude is back to zero (maybe not zero, but the commands it ran are almost always gone).

It doesn't remember. It fumbles. Runs commands that already failed an hour ago. Burns tokens rediscovering what it already knew. You watch it fail three times before you interrupt and tell it what to do.

Or worse — you don't remember either. You both saw it work. Neither of you knows how.

## The bad options

**CLAUDE.md curation.** Write down commands that might be important later. Works if you're focused on one project — you can curate CLAUDE.md and skills to capture what matters. But if you juggle dozens of projects, maintaining these becomes a burden. And you never know what's important until you need it.

**Let Claude rediscover.** Watch it fumble through the same trial-and-error. Same failed attempts, same eventual solution. Tokens burned, time wasted, patience tested.

**Copy-paste from terminal history.** That's your shell history, not Claude's. It doesn't know which commands were Claude's, which worked, which failed, or what project they belonged to.

**Grep through session files.** Claude Code stores everything in `~/.claude/projects/`. JSONL files, one per session. Technically searchable. Practically miserable.

## The actual problem

The history exists. Every bash command Claude runs gets logged — the command, what Claude said it does, whether it succeeded, the working directory, the timestamp. It's all there.

But it's scattered. Each project has its own folder. Each session is a separate file. There's no cross-project search. No unified view. No `ctrl+r`.

You ran 2,800 commands across 40 projects. Good luck finding the one you need.

## `ran`

```
$ ran search "docker build" --limit 4

[ok] docker build --no-cache --platform linux/amd64 -t ghcr.io/user/api-service:latest .
     Rebuild without cache for production
     12/30/2025, 12:46 AM | ~/projects/api-service

[ok] docker build -t api-service:test .
     Build test image
     12/30/2025, 12:45 AM | ~/projects/api-service

[ok] docker run --rm api-service:test npm test
     Run tests in container
     12/30/2025, 12:46 AM | ~/projects/api-service

[ok] docker push ghcr.io/user/api-service:latest
     Push to registry
     12/30/2025, 12:48 AM | ~/projects/api-service
```

One command. All sessions. All projects.

The `[ok]` and `[error]` markers show what worked. The descriptions remind you why. The paths tell you where.

```bash
# What did I run in a specific project?
$ ran search "" --cwd /projects/api --limit 20

# Regex for complex patterns
$ ran search "kubectl.*deploy" --regex

# Just show recent commands
$ ran list --limit 50
```

`ctrl+r` for Claude.

## How it works

Claude Code stores sessions as JSONL in `~/.claude/projects/{project-path}/{session-id}.jsonl`. Each line is a JSON object — messages, tool calls, results.

`ran` scans these files, extracts bash tool invocations, and indexes them into SQLite at `~/.ran/history.db`. It tracks file positions, so subsequent syncs only process new content.

By default, `search` and `list` auto-sync before returning results. The index stays current without you thinking about it.

What gets stored:

| Field | What it is |
| --- | --- |
| `command` | The bash command |
| `description` | Claude's explanation of what it does |
| `cwd` | Working directory |
| `timestamp` | When it ran |
| `is_error` | Whether it failed |
| `stdout/stderr` | Output (stored, not displayed by default) |
| `session_id` | Which session ran it |

## For Claude

Run `ran onboard` and it adds a section to your `~/.claude/CLAUDE.md`:

```markdown
## ran - Claude Code bash history

Use the `ran` CLI to search commands from previous Claude Code sessions:

- `ran search <pattern>` - Search by substring or regex (`--regex`)
- `ran list` - Show recent commands
- `ran search "" --cwd /path` - Filter by directory

Example: "What docker command did you run?" → `ran search docker`
```

Now Claude knows how to search its own history.

## What's next

Ideas, not promises:

**Starring.** Mark commands as important. Starred commands float higher in search results. That deploy script you always forget? Star it once, find it forever.

**Keyword extraction.** Auto-tag commands with normalized keywords. "docker build" and "docker image build" surface together. Helps both you and Claude search with better terms.

**Frecency.** Rank by frequency + recency, not just timestamp. Commands you run often and ran recently should rank higher than one-offs from last month.

**Shell integration.** `ran !!` to re-run the last match. Pipe to fzf for interactive selection. Make it feel native.

## Try it

```bash
# Install
bun add -g clauderan
# or
npm install -g clauderan

# Search
ran search docker

# List recent
ran list
```

Code: [github.com/Michaelliv/clauderan](https://github.com/Michaelliv/clauderan)

---

Context resets. History shouldn't.
