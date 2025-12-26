---
title: "psst v0.1.3: Now It Actually Masks Your Secrets"
description: "The secrets manager for agents now redacts output, imports .env files, and locks your vault."
pubDate: 2025-12-26
tags: ['agents', 'security', 'cli', 'open-source']
---

[psst](/blog/psst-secrets-for-agents) shipped. People used it. They found some gaps.

The original version solved one problem: agents could use secrets without seeing them. But what about the output? If your curl returns `{"api_key": "sk_live_..."}`, the secret leaks anyway.

v0.1.3 fixes this. Output is now masked by default. Any secret value that appears in stdout gets replaced with `[REDACTED]`.

```bash
psst STRIPE_KEY -- curl https://api.stripe.com/v1/balance
# Output shows [REDACTED] instead of the actual key
```

Other additions:

**Import/export.** `psst import .env` pulls secrets from an existing .env file. `psst export` dumps them back out. Migration path for existing workflows.

**Vault locking.** `psst lock` encrypts the vault with a password (PBKDF2 + AES-256-GCM). Unlocking requires the password. For when OS keychain isn't enough.

**Environment fallback.** If a secret isn't in the vault, psst checks environment variables before failing. Graceful degradation.

**JSON output.** `--json` flag for scripting. `--quiet` for silence. Semantic exit codes for automation.

The goal remains the same: agents orchestrate, secrets stay invisible.

[github.com/Michaelliv/psst](https://github.com/Michaelliv/psst)
