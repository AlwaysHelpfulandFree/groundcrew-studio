# Groundcrew

`groundcrew-studio` on npm, GitHub and plugin marketplaces.

**The team behind every safe launch — for builders who ship with AI.**

AI coding agents let anyone build an app in a weekend. Most of those apps go live
with the same problems: authorisation that only exists in the UI, secrets in the
frontend, tokens in `localStorage`, flows that break on the second click, a design
that looks machine-made, no privacy policy, and a hosting bill nobody planned for.

Groundcrew turns your coding agent into the crew a real product has behind it —
product manager, UX and visual designer, architect, engineer, QA, security,
legal and compliance, DevOps and operations. Tell it your idea (or point it at the
app you already built) and it leads the conversation from there, one decision at a
time, in plain language.

Nothing goes live until it has cleared QA, security and legal. Those gates are hard.

> Groundcrew can't make any app unhackable or give legal advice — nothing can. What it
> does is make sure the common, easy-to-exploit mistakes are caught and closed every
> time, the legal basics are drafted from what your app really does, and high-risk
> areas are flagged for a professional.

## The crew

| # | Stage | Who | What you get |
|---|---|---|---|
| 0 | Intake | Project lead | New build or rescue of an existing app; your project file |
| 1 | Product | Product manager | Problem, users, MVP scope, what *not* to build |
| 2 | UX | UX designer | Every user flow, including empty, error and loading states |
| 3 | UI | Visual designer | A visual identity for *your* audience, as design tokens — not the default AI look |
| 4 | Architecture | Architect | Stack (yours, or stated defaults), services, data model, auth model, cost estimate |
| 5 | Foundation | Engineer | Git repos, Docker, Make, env handling, CI |
| 6 | Build | Engineer | Features built in small, working, committed slices |
| 7 | **QA** 🔒 | QA engineer | Tests and real end-to-end runs of every flow |
| 8 | **Security** 🔒 | Security engineer | Baseline checklist + deep audit, everything fixed |
| 9 | **Legal** 🔒 | Legal & compliance | Privacy policy, terms, cookies and more, drafted from your real data flows, signed off by you |
| 10 | Deploy | DevOps | Production with spend caps, backups and one-step rollback |
| 11 | Launch readiness | Project lead | Accessibility, performance, SEO, analytics, monitoring |
| 12 | Operate | SRE | Monitoring, incident playbook, updates, scheduled re-audits |

🔒 = hard gate. Deploy commands are blocked until all three pass on the exact commit
being deployed.

## How it works

- **It drives.** You describe the idea; Groundcrew asks the next useful question,
  recommends an answer, and keeps moving. Non-technical? It explains as it goes and
  walks you through every account and command. Developer? It skips the hand-holding.
- **It remembers.** Progress lives in `.groundcrew/project.md` inside your repo, so
  you can stop, switch machines or switch agents and pick up where you left off.
- **It's stack-agnostic.** Use your stack, or let it choose sensible defaults —
  which it always tells you about. Default shape: a root repo that runs the whole
  app, a few right-sized services in their own repos (as git submodules), Docker,
  Make and SOLID object-oriented code.
- **It handles existing apps.** Point it at a half-built or live app and it runs a
  rescue audit across every stage, stops any live data exposure first, then fixes
  things in priority order.
- **It holds the line on security.** Tokens never touch frontend code (HttpOnly
  cookies on web, OS secure storage on mobile), authorisation is enforced on the
  server for every object, and secrets never enter code or the chat.

## Install

Groundcrew follows the open [Agent Skills](https://github.com/agentskills/agentskills)
format, so the same skill works in Claude Code, Codex, Cursor, Antigravity, Gemini
CLI, Cline and other compatible agents.

### Claude Code (recommended: includes the deploy-gate hook)

```
/plugin marketplace add AlwaysHelpfulandFree/groundcrew-studio
/plugin install groundcrew-studio@groundcrew-studio
```

### Any agent (via the Skills CLI)

```
npx skills add AlwaysHelpfulandFree/groundcrew-studio
```

### npm (for CI and scripts)

```
npx groundcrew-studio install   # installs the skill into every agent on this machine (uses the Skills CLI)
npx groundcrew-studio gate      # deploy gate check; exits non-zero when blocked
```

### Manually

Copy `skills/groundcrew` into your agent's skills folder (for example
`.claude/skills/`, `.agents/skills/`, or `.cursor/skills/`).

## Use it

Start your agent in an empty folder or in your existing project and say what you want:

```
I want to build an app where local tailors can take orders and measurements from customers
```

```
I vibe coded this booking app and it's live. Can you check it's safe and fix what's broken?
```

```
/groundcrew-studio:groundcrew
```

## How the gate is enforced

| Agent | Enforcement |
|---|---|
| Claude Code with the plugin | A `PreToolUse` hook runs `gatecheck.cjs` before every shell command and blocks recognised deploy commands (Wrangler, Vercel, Netlify, Fly, Railway, Firebase, GCP, AWS, Terraform, Kubernetes, Docker push, EAS, Fastlane, `make deploy`, and pushes to auto-deploy branches) unless the gates have passed |
| Any agent | The project's `AGENTS.md` carries the rules, and `make deploy` runs the gate check first |
| CI | The deploy workflow runs `node .groundcrew/gatecheck.cjs` before deploying |

A gate passes on a specific commit. Change code after it passes and it needs a
re-check; uncommitted code can't be deployed. A live app being rescued can deploy a
single, owner-approved security fix through an emergency path.

## Built with

- [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill)
  (MIT) — Groundcrew runs it for the deep security audit in agents that support
  parallel sub-agents, on top of its own baseline checks.

## Roadmap

- [x] Project lead skill, stage playbooks, deploy gate
- [ ] Dedicated skill per crew role (product, UX, UI, architect, engineer, QA,
      security, legal, DevOps, ops) for deeper guidance and direct use
- [ ] Claude Code subagents for independent QA and security review
- [ ] Legal document templates per jurisdiction (EU, UK, US, wider EMEA)
- [ ] Eval suite runnable with `claude plugin eval`

## Contributing

Issues and pull requests welcome — especially new "generated design" tells,
security baseline items, deploy commands the gate should recognise, and
jurisdiction-specific legal requirements.

## License

MIT
