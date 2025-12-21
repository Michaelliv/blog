---
title: "psst 🤫 Because Your Agent Doesn't Need to Know Your Secrets"
description: "I built a secrets manager where agents use secrets without seeing them."
pubDate: 2025-12-22
---

I have a confession.

```bash
# "Just this once..."
curl -H "Authorization: Bearer sk-live-YOLO420..." https://api.stripe.com

# "The agent needs it..."
OPENAI_API_KEY=sk-... claude "please help me debug"

# "I'll delete it from the chat after..."
Hey Claude, my database password is hunter2, can you...
```

We've all done it. The secret is now in the model's context, in our terminal history, possibly in logs, maybe in training data. We tell ourselves it's fine. It's not fine.

## The Problem

When you give an agent shell access, it needs secrets to do real work. Call APIs. Deploy code. Access databases. The standard approaches all leak:

**Environment variables?** The agent can run `env` and see everything. Or it runs `export STRIPE_KEY=...` and now the secret is in its context.

**.env files?** The agent can `cat .env`. Easy.

**Paste it in chat?** Now it's in the conversation history. Possibly forever.

The agent doesn't need to *know* your Stripe key. It just needs to *use* it.

## The Insight

What if secrets could be injected at the last possible moment - into the subprocess environment - without ever touching the agent's context?

```bash
# Agent writes this:
psst STRIPE_KEY -- curl -H "Authorization: Bearer $STRIPE_KEY" https://api.stripe.com

# What the agent sees:
# ✅ Command executed successfully

# What actually ran:
# curl -H "Authorization: Bearer sk_live_abc123..." https://api.stripe.com
```

The agent orchestrates. It knows *which* secret to use. But it never sees the value.

## How It Works

```
┌───────────────────────────────────────────────────────┐
│  Agent Context                                        │
│                                                       │
│  "I need to call Stripe API"                          │
│  > psst STRIPE_KEY -- curl https://api.stripe.com     │
│                                                       │
│  [Command executed, exit code 0]                      │
│                                                       │
│  (Agent never sees sk_live_...)                       │
└───────────────────────────────────────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────────────┐
│  psst                                                 │
│                                                       │
│  1. Retrieve encryption key from OS Keychain          │
│  2. Decrypt STRIPE_KEY from local vault               │
│  3. Inject into subprocess environment                │
│  4. Execute command                                   │
│  5. Return exit code (not the secret)                 │
└───────────────────────────────────────────────────────┘
```

Secrets are encrypted at rest with AES-256-GCM. The encryption key lives in your OS keychain (macOS Keychain, libsecret on Linux). Zero friction - no passwords to type.

## The Interface

Setup once:

```bash
npm install -g @pssst/cli
psst init
psst set STRIPE_KEY          # interactive prompt, value hidden
psst set OPENAI_API_KEY
```

Then agents just use it:

```bash
psst STRIPE_KEY -- curl https://api.stripe.com
psst AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY -- aws s3 ls
psst DATABASE_URL -- prisma migrate deploy
```

That's the whole API. One pattern: `psst SECRET -- command`.

## Agent Onboarding

Run `psst onboard` in your project and it adds instructions to your `CLAUDE.md` or `AGENTS.md`:

```markdown
## Secrets Management (psst)

Use `psst SECRET -- command` to run commands with secrets.
Never ask the user to paste secrets in chat.
If a secret is missing, ask them to run `psst set SECRET_NAME`.
```

It also teaches agents to shame you if you try to paste a secret in plain text. Because we all need accountability.

## Local-First, Agent-First

No cloud. No sync. No account. Your secrets stay on your machine, encrypted, accessible only through the keychain.

The first customer is the agent. The interface is designed for non-human use. Humans just set things up and let the agent work.

## Try It

```bash
npm install -g @pssst/cli
psst init
psst set MY_SECRET
psst MY_SECRET -- echo "The secret is $MY_SECRET"
```

Code: [github.com/Michaelliv/psst](https://github.com/Michaelliv/psst)

---

*psst* 🤫 — because your agent doesn't need to know your secrets.
