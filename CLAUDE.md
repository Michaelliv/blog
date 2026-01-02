# /dev/michael Blog

Personal blog built with Astro. Deployed on Vercel at michaellivs.com.

## Writing Posts

When co-authoring blog posts with Michael:

1. **Use the writing-guidelines skill** - Check `.claude/skills/writing-guidelines/SKILL.md` for current guidelines
2. **Update the skill** - After each editing session, update the skill with any new preferences learned
3. **Log preferences** - Add specific examples to the "Learned Preferences Log" section
4. **Track posts** - Add completed posts to the "Posts Written Together" section

## Content Location

- Posts go in `src/content/blog/` as `.md` files
- Frontmatter: `title`, `description`, `pubDate`
- No hero images (minimal style)

## Style Notes

- Nerdy minimal aesthetic
- No fluff, no emojis
- Technical but accessible
- Simon Willison-inspired clarity

## SEO

### Already Configured
- Sitemap + robots.txt
- Canonical URLs
- OG images (auto-generated at build)
- JSON-LD BlogPosting schema
- Twitter/OG meta tags
- RSS feed
- Google Search Console verified

### New Post Checklist
- [ ] Description: 120-160 characters, keyword-rich (verify with `node -e "console.log('...'.length)"`)
- [ ] Tags: Include relevant tags (enables related posts linking)
- [ ] Title: Clear, searchable (what someone would Google)
- [ ] First paragraph: Contains key terms naturally
- [ ] Internal links: Link to other relevant posts in the content where natural

### Tags
Reuse existing tags when relevant, add new ones when needed:

`agents`, `llms`, `infrastructure`, `open-source`, `security`, `cli`, `context-engineering`, `tool-design`, `sandboxing`, `claude-code`, `astro`, `meta`

## Deployment

Push to `main` → auto-deploys to Vercel

## Promotion

Relevant subreddits for AI/agents content:
- r/AI_Agents
- r/OpenAI
- r/LangChain
- r/LocalLLaMA
- r/ollama
- r/LLMDevs
- r/Anthropic
- r/programming
- r/ClaudeAI
- r/ChatGPT
- r/MachineLearning
- r/PromptEngineering
- r/crewai
- r/cursor
- r/singularity
