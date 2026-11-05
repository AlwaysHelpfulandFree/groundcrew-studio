# Defaults

Groundcrew is stack-agnostic. Use the owner's stack when they have one. Use these
defaults only when they haven't chosen, and **always say aloud** what you picked,
why (one sentence), and that it can be changed. Record each default in the project
file's Decisions, marked "default".

Prices and free tiers change constantly: check them with a web search before
quoting a cost, and present costs as estimates with the date checked.

## Why these defaults

Chosen for: one language across web, API, worker and mobile (TypeScript), so a
small team or a solo owner with an AI agent can work everywhere; class-based
dependency injection that makes SOLID design natural; mature security defaults;
and low running costs at small scale.

## Default stack

| Layer | Default | Reason |
|---|---|---|
| Web | Next.js (TypeScript), acting as the backend-for-frontend that holds the session cookie | Server rendering + a same-site server layer keeps tokens out of the browser |
| API | NestJS (TypeScript) | Classes, modules and dependency injection map directly onto SOLID |
| Worker | NestJS standalone app | Same patterns as the API; runs queues and scheduled jobs |
| Mobile | Expo / React Native (TypeScript), `expo-secure-store` for tokens | One codebase for iOS and Android, shares types with web |
| Database | PostgreSQL, with an ORM that does migrations (Prisma or Drizzle) | Relational integrity, row-level security available, cheap managed options |
| Queue | Postgres-backed queue (e.g. pg-boss) | One fewer service to pay for; move to Redis/BullMQ when volume demands |
| Auth | A maintained auth library or provider configured for server-side cookie sessions | Never hand-roll password or session crypto |
| Object storage | S3-compatible storage with no egress fees (e.g. Cloudflare R2) | Uploads stay private; egress fees are a common surprise bill |
| Edge | Cloudflare: DNS, TLS, WAF, rate limiting, Turnstile | Free tier covers most of the security baseline at the edge |
| Hosting (web) | A platform that runs Next.js with low ops (e.g. Cloudflare Workers via OpenNext, or Vercel) | Free/cheap at launch scale |
| Hosting (API, worker) | A managed container platform (e.g. Fly.io, Railway, Render) — or one small VM with Docker Compose for the lowest fixed cost when the owner can handle a server | Docker images run anywhere, so moving later is easy |
| Managed Postgres | e.g. Neon, Supabase (database only), or the container host's own | Backups and point-in-time restore included |
| Email | A transactional email provider (e.g. Resend, Postmark) | Deliverability; SPF/DKIM/DMARC support |
| Payments | Stripe; for African markets also Paystack or Flutterwave | Card data never touches the app |
| Errors | Sentry (with personal-data scrubbing) | Free tier at launch scale |
| Analytics | Privacy-friendly (e.g. Plausible, Umami) or PostHog with consent | Less consent friction, simpler privacy policy |
| CI | GitHub Actions | Free for most small projects; lives next to the code |
| Tests | Vitest/Jest, Playwright (web e2e), Maestro (mobile e2e) | Widely supported, agent-friendly |

Owner on another stack (e.g. Python/FastAPI, Laravel, Rails, Go, Flutter, Supabase-
only)? Keep the same shape and rules: class-based services with injected
dependencies, server-side cookie sessions for web, secure-store tokens for mobile,
migrations, Docker, Make.

## Repository layout

Default: a root repo that runs the whole app, plus one repo per service, included
as git submodules.

```
acme/                      ← root repo ("acme")
├── .groundcrew/           ← project file, gates, gatecheck, reports
├── web/        (submodule → acme-web)
├── api/        (submodule → acme-api)
├── worker/     (submodule → acme-worker)
├── mobile/     (submodule → acme-mobile, if in scope)
├── docs/                  ← product, UX, design system, architecture, ADRs, legal
├── docker-compose.yml
├── Makefile
├── .env.example
├── AGENTS.md / CLAUDE.md  ← includes the Groundcrew block
└── README.md
```

**Right-size the split.** Start with services at real boundaries — something that
runs differently (web vs API vs background jobs vs mobile), scales differently, or
has a different owner. Inside a service, keep features as modules. Split a module
into its own service only when it has earned it (independent scaling, a separate
team, a very different runtime). Explain this to the owner: more services means
more repos to manage, more hosting cost and more attack surface.

**Sharing types between services:** the API publishes an OpenAPI spec; web and mobile
generate typed clients from it. Avoid a shared-code repo until it's clearly needed.

### Submodules, explained for the owner
Submodules confuse experienced developers too, so walk owners through them and
prefer Make targets that hide the details:
- Getting everything: `git clone --recursive <root repo>`, or `make setup`.
- After pulling the root repo: `git submodule update --init --recursive` (in `make setup`).
- Changing a service: commit and push inside that service's folder first, then
  commit in the root repo (which records the new service version). Explain that the
  root repo pins exact versions of each service — that's what makes a deploy
  reproducible.

## Code structure inside each service (SOLID)

```
src/
├── modules/<feature>/
│   ├── <feature>.controller.ts     ← HTTP only: parse, validate, call use case
│   ├── <feature>.service.ts        ← use cases / application logic
│   ├── <feature>.policy.ts         ← authorisation rules (who may do what)
│   ├── <feature>.repository.ts     ← interface for data access
│   └── <feature>.entity.ts         ← domain model
├── infrastructure/                 ← DB, email, payments, storage adapters
└── common/                         ← config, logging, errors, guards
```

- **S**ingle responsibility: controllers don't hold business logic; services don't
  know HTTP.
- **O**pen/closed: add behaviour through new classes (e.g. a new payment provider
  adapter), not by editing switch statements.
- **L**iskov: adapters are interchangeable behind their interface (a fake email
  sender in tests).
- **I**nterface segregation: small interfaces per need, not one giant "service".
- **D**ependency inversion: services depend on interfaces; the framework's DI
  container wires real implementations.

## Docker conventions

- Multi-stage builds; small, pinned base images; run as a non-root user.
- Health checks for each service.
- `docker-compose.yml` for local: database with a named volume, only web/API ports
  exposed to the host, services on an internal network.
- No secrets baked into images; config via environment.

## Cost guidance

Estimate monthly cost at launch, ~1k users and ~10k users, listing each service.
Prefer free tiers at launch, but flag where a free tier sleeps, deletes data, or has
no backups — those are not acceptable for production data. Put spend caps on
everything before going live.
