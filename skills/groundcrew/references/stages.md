# Groundcrew stages

Read the section for the stage you are entering. Each has: the goal, what to do,
what to ask the owner, the output, and when it's done. Scale depth to the project:
a hobby app moves through each stage quickly; anything handling money, health,
children or other people's private data gets the full treatment.

## Contents
1. Product
2. UX
3. UI
4. Architecture
5. Foundation
6. Build
7. QA (gate)
8. Security (gate)
9. Legal (gate)
10. Deploy
11. Launch readiness
12. Operate

---

## 1. Product

**Goal:** know exactly what is being built, for whom, and what is *not* being built.

Do:
- Turn the idea into a one-paragraph problem statement: who has the problem, how
  they cope today, why that's painful.
- Identify the primary user (and any secondary roles: admin, vendor, staff).
- Do a quick competitor scan (web search): what exists, and what this app does
  differently. If nothing is different, say so kindly and help find the angle.
- Split features into **MVP** (needed for the first real user to get value),
  **later**, and **not doing**. Vibe-coded projects usually die from scope; be the
  person who cuts.
- Agree one success measure for the first month (e.g. "10 paying users", "50
  bookings").
- Note how it makes money, if it does.
- **Flag risk categories now** — children, health, finance/payments holding funds,
  employment, regulated advice, user-generated content, AI features acting on user
  data, location tracking. They change the depth of Security and Legal.

Ask the owner: who it's for, what the first user does on day one, how it earns,
what would make them call it a success. One question per message.

Output: `docs/product.md` (problem, users, MVP list, later list, non-goals,
success measure, risk categories). Summarise it back and get a "yes".

Done when: the owner has approved the MVP list and the non-goals.

## 2. UX

**Goal:** every path a person can take through the app is designed before it's built.

Do:
- Write a flow for each MVP task, start to finish, as a short numbered list or a
  Mermaid flowchart. Include sign-up, sign-in, sign-out, password reset, and
  **account deletion** (required by Apple for apps with accounts, and by GDPR).
- For every screen in a flow, define its **empty, loading, error and success
  states**, and what happens when the network drops or the user double-taps.
  These are where generated apps break.
- Define roles and permissions: who can see and do what. This becomes the
  authorisation model in Architecture.
- Plan onboarding: what a brand-new user sees with no data.
- Note notifications/emails each flow sends.
- Consider accessibility from the start: keyboard paths, focus order, labels,
  touch target sizes, no information carried by colour alone.
- Mobile in scope? Decide which flows exist on web, mobile or both, and respect
  platform conventions (back behaviour, navigation patterns).

Ask the owner: walk them through each flow in plain words ("A customer opens the
app, sees…, taps…") and ask "is that how you picture it?"

Output: `docs/ux-flows.md` (flows, states, roles/permissions matrix, screen list).

Done when: the owner has walked through every MVP flow and agreed.

## 3. UI

**Goal:** a visual identity that belongs to this product and its audience, and a
design system the build follows — not a tool's default look.

The principle: **every visual choice must trace back to the brand, the audience
or the content.** If the only reason for a choice is "it's the default" or "it's
what these apps look like", it's the wrong choice. Generated interfaces look
generated because they are averages; the cure is specificity.

Do:
- Define the brand personality in three to five words with the owner (e.g.
  "warm, practical, local, no-nonsense"), and who the audience is visually
  (age, context of use, what else they use).
- Derive from that: colour palette (with accessible contrast — WCAG AA minimum),
  type pairing chosen for the personality (not the framework's default font),
  spacing scale, corner radius and elevation chosen deliberately (and varied by
  component purpose, not one value everywhere), iconography from one coherent
  set chosen for the tone, imagery direction (real photography, illustration
  style, or none).
- Capture these as **design tokens** (CSS variables / theme file) so the build can't
  drift back to defaults. Theme any component library fully.
- Design the key screens with **real content** — real product names, realistic
  numbers, real copy in the brand's voice. Placeholder copy hides layout problems.
- Write copy like the brand would speak. Cut marketing filler.
- Self-review against "would a thoughtful human designer have chosen this for this
  audience?" and against common tells of generated design, for example:
  - purple/blue/pink gradients, glow, glassmorphism, blurred blobs, mesh gradients,
    gradient text
  - the stock landing page: centred headline, subhead, two buttons, then a row of
    three icon-in-a-circle feature cards; every section the same rhythm
  - one large radius (`rounded-2xl`) and one drop shadow on everything, uniform
    card grids, pill badges everywhere
  - emoji in UI, sparkle icons, "AI-powered" badges, robot avatars for assistants
  - default Inter/system font everywhere; unthemed Tailwind or shadcn styling
  - filler copy ("Unlock the power of…", "Seamless", "Elevate your…",
    "Revolutionise"), invented testimonials or stats, generic 3D stock
    illustrations, neon-on-black "dark mode" as a personality
  These are symptoms, not the full list — new defaults emerge as tools change.
  Judge by the principle: does this look like *this* product, or like *any* product?
- For mobile, respect each platform's conventions while keeping the brand.

Ask the owner: personality words, any brands they admire (and why), anything they
hate. Show them two directions where it helps, not ten.

Output: `docs/design-system.md` + token file in the web (and mobile) repo + key
screens (as built pages, or images/HTML mockups).

Done when: the owner has picked a direction and approved the key screens.

## 4. Architecture

**Goal:** a design that is secure by construction, sized to the project, and cheap
to run. Read `non-negotiables.md` and `defaults.md` first.

Do:
- Choose the stack: the owner's choice if they have one, otherwise defaults —
  stated aloud with the reason.
- Define services at real boundaries (default: web, API, worker, mobile if in
  scope). For each: responsibility, what it owns, how it talks to others.
- Data model: entities, relationships, **ownership** (which user/organisation owns
  each row — this is what authorisation checks against), what is personal data,
  retention.
- Auth model: how users sign up/in, session cookies for web, secure-store tokens for
  mobile, roles/permissions from the UX matrix, admin access, MFA for admins.
- API design: resources, validation at the boundary, error format, versioning,
  rate limits on auth and expensive endpoints.
- Background work: what runs async (emails, uploads processing, webhooks).
- Third parties: payments, email, storage, analytics, AI providers — each one is
  also a data processor for Legal.
- Data residency: where data is stored, and whether that matters for the
  jurisdictions in play (EU/UK users → prefer EU/UK region or ensure transfer
  safeguards).
- Code design: SOLID object-oriented structure in each service — domain logic in
  classes with single responsibilities, dependencies injected through interfaces,
  framework and database at the edges so they can be tested and swapped.
- Cost estimate at three sizes (launch, ~1k users, ~10k users), using current prices.
- Record significant choices as short decision records in `docs/adr/`.

Ask the owner: approve the stack (or keep theirs), approve the cost estimate.

Output: `docs/architecture.md` (+ a diagram), `docs/adr/*.md`.

Done when: the owner has approved the stack and cost, and the auth and ownership
model covers every permission in the UX matrix.

## 5. Foundation

**Goal:** a project anyone can clone and run with two commands, under version
control from the first file.

Do (guiding a non-technical owner click by click through account steps):
- GitHub: create an organisation (or use theirs), the root repo and one repo per
  service. Private by default.
- Root repo: services as git submodules, `docker-compose.yml`, `Makefile` (start
  from `assets/Makefile`), `.env.example` (names only, no values), `.gitignore`,
  `README.md` with "how to run".
- Each service repo: Dockerfile (non-root user, pinned base image, multi-stage),
  its own Makefile (`test`, `lint`, `audit`), README, `.env.example`.
- Secret scanning before every commit (e.g. gitleaks pre-commit hook) and in CI.
- Lint and format config; tests runnable with `make test`.
- CI (e.g. GitHub Actions): lint, test, dependency audit, secret scan on every push;
  the root repo's deploy workflow runs the gate check first.
- Branch protection on `main` once there's more than one contributor.
- Copy `gatecheck.cjs` into `.groundcrew/` if not done at Intake.

Done when: on a clean machine, `git clone --recursive …`, `make setup`, `make up`
brings the (empty) app up, and CI is green.

## 6. Build

**Goal:** working features, built in thin vertical slices that each work end to end.

Do:
- Build one flow at a time from `ux-flows.md`, through every layer (UI → API →
  data), including its empty/loading/error states and its authorisation check.
- Follow the design tokens; no one-off colours, fonts or radii.
- Validate all input at the API boundary (schema validation), parameterise every
  query, encode output.
- Handle errors deliberately: users see a helpful message, logs get detail without
  personal data or secrets.
- Database changes only through migrations; seed data for local development.
- Write tests alongside each slice (see QA for what matters most).
- Commit each slice with a clear message. Update `project.md`.
- Remove dead code, leftover TODOs, debug logging and unused dependencies as you go.
- Show the owner each finished flow running before starting the next.

Done when: every MVP flow works locally on `make up`, demonstrated to the owner.

## 7. QA (gate)

**Goal:** prove it works, the way a real user would use it — not "the code compiles".

Do:
- Unit tests for domain logic; integration tests for each API endpoint, including
  **authorisation tests with two separate users** (user B must not read or change
  user A's data) and a signed-out user.
- End-to-end tests of every MVP flow from `ux-flows.md` (web: e.g. Playwright;
  mobile: e.g. Maestro or Detox), including error paths: wrong password, expired
  session, failed payment, empty states, double submit, slow network.
- Run the app from a clean clone with `make setup && make up` and walk every flow
  yourself (use a browser tool if available), on desktop and mobile viewports.
- Check forms with keyboard only; check obvious accessibility with an automated
  checker (e.g. axe).
- Check performance basics: no page that hangs, no unbounded list queries.
- Record results in `.groundcrew/reports/qa.md`: what was tested, what passed,
  what was fixed.

Gate passes when: all tests pass in CI, every MVP flow passes end to end, no
known broken flow remains. Record the commit in `gates.json`.

## 8. Security (gate)

**Goal:** close every common, exploitable mistake, and audit for the less common
ones. Read `non-negotiables.md`.

Part A — Groundcrew baseline (every project, every agent). Check each item against
the actual code and config, not the plan:
- Sessions and tokens per the non-negotiables (cookie flags, CSRF, no tokens in
  frontend, mobile secure store, rotation, logout invalidates server-side).
- Passwords hashed with Argon2id or bcrypt; or use a reputable auth provider.
  Rate limit and lock out brute force; bot protection on sign-up and sign-in.
- Server-side authorisation on every endpoint and every object ID (no IDOR);
  tenant isolation; admin routes separately protected; database row-level security
  if the database is exposed to clients (e.g. Supabase).
- Input validation and output encoding; parameterised queries; no `eval`-style
  execution of user input; safe HTML rendering.
- CORS restricted to known origins (never `*` with credentials).
- Security headers: Content-Security-Policy, Strict-Transport-Security,
  X-Content-Type-Options, frame-ancestors / X-Frame-Options, Referrer-Policy,
  Permissions-Policy.
- File uploads: type and size limits, stored outside the web root / in object
  storage, served with safe content types, private by default.
- Outbound requests to user-supplied URLs guarded against SSRF.
- Webhooks verify signatures; payment amounts and prices decided server-side.
- Secrets: none in code, git history (scan the whole history), frontend bundle or
  mobile binary; least-privilege keys; database not publicly reachable;
  least-privilege database user.
- Dependencies: no known high/critical vulnerabilities; lockfiles committed.
- Errors and logs: no stack traces to users; no tokens, passwords or unnecessary
  personal data in logs or analytics.
- AI features (if any): prompt injection considered, model tools limited to the
  user's own permissions, model output treated as untrusted, per-user rate and
  spend limits.
- Infrastructure: TLS everywhere, WAF/DDoS protection (e.g. Cloudflare proxy),
  rate limiting at the edge, backups encrypted.
- Mobile: no secrets in the app bundle, deep links validated, sensitive screens
  excluded from screenshots/app switcher where appropriate.

Part B — Deep audit (when the agent supports sub-agents): run Cloudflare's
`security-audit` skill (see SKILL.md). Treat its confirmed findings as blockers.

Fix everything found, then re-check the fixes. Where possible, the re-check is done
by an agent that didn't write the fix.

Write `.groundcrew/reports/security.md`: what was checked, findings, fixes,
anything accepted (low severity only, with the owner's recorded reason).

Gate passes when: every baseline item is satisfied, and no confirmed critical,
high or medium finding remains open. Record the commit in `gates.json`.

## 9. Legal (gate)

**Goal:** the documents and practices the law expects for this app, drafted from what
the app *actually does*, approved by the owner. Not legal advice — and say so.

Do:
1. **Data map** — from the code, not the plan: every piece of personal data
   collected, why, where it's stored (region), who it's shared with (every
   third-party SDK, analytics script, email/payment/AI provider), how long it's kept.
   Save as `docs/legal/data-map.md`.
2. **Applicable regimes** — based on where users are and what the app does. Groundcrew
   covers EU, UK, US and wider EMEA; check current requirements with a web search,
   as these change. Typical set:
   - EU: GDPR, ePrivacy cookie consent, Digital Services Act (if hosting user
     content), EU AI Act transparency duties (if users interact with AI), European
     Accessibility Act (consumer e-commerce and some services), consumer law (14-day
     withdrawal for online sales).
   - UK: UK GDPR + Data Protection Act 2018, PECR (cookies, marketing), Consumer
     Contracts Regulations, Online Safety Act (user-to-user content).
   - US: state privacy laws (CCPA/CPRA and others), COPPA (under-13s), CAN-SPAM,
     sector rules (HIPAA, GLBA) if relevant, ADA accessibility expectations.
   - Wider EMEA: e.g. Nigeria NDPA, South Africa POPIA, Kenya DPA, UAE and Saudi
     PDPL — include the ones where the owner is based or has users.
3. **Documents** (only those that apply): privacy policy; terms of service;
   cookie policy plus a real consent banner (non-essential cookies off until
   consent where required); acceptable use policy (user content); refund and
   cancellation policy; data processing agreement and sub-processor list (B2B);
   AI use disclosure; accessibility statement; notice-and-takedown process;
   company/contact details page (e.g. Impressum for Germany/Austria).
4. **Operational duties** — the documents promise things; make sure the app can do
   them: data export and deletion requests, account deletion in-app, breach
   response plan (GDPR: 72 hours to the regulator), records of processing, age
   checks if needed, marketing opt-in.
5. **Cross-check** — every claim in the documents matches the data map and the code.
   A privacy policy that doesn't match reality is worse than a short honest one.
6. **High-risk flags → a real lawyer.** Health data, children, holding or moving
   money, lending, investment, gambling, crypto, employment decisions, biometric
   data, regulated professional advice. Say plainly: these drafts are a starting
   point; a qualified lawyer must review before launch. Record the flag as a gate
   blocker until the owner confirms the review happened.
7. **Sign-off** — present each document with a short plain-language summary of
   what it commits the owner to, and the facts they must confirm (legal entity
   name, address, contact email, governing law). Ask for explicit approval.
   Record name and date in `gates.json` → `legal.signed_off_by`.

Write `.groundcrew/reports/legal.md` listing documents, regimes considered, flags,
and the sign-off.

Gate passes when: every applicable document is drafted, cross-checked, published in
the app (linked from sign-up and footer/settings), operational duties are
implemented, high-risk flags are resolved, and the owner has signed off. Legal
doesn't go stale on every code change, but **re-open it whenever data collection,
third parties or target countries change**.

## 10. Deploy

Only after `make gate` passes. Read `defaults.md` for hosting defaults.

Do:
- Before creating anything billable: spend caps / budget alerts on every account
  (cloud, AI provider, email, database). Walk the owner through it.
- Production environment separate from development; secrets in the host's secret
  store; production database in the agreed region, not publicly reachable.
- Domain, DNS and TLS; put the site behind Cloudflare (or equivalent) for WAF,
  DDoS protection and caching.
- Email deliverability: SPF, DKIM, DMARC for the sending domain.
- Backups: automated, encrypted, and **one restore actually tested**.
- CI/CD: deploys only from the root repo's main branch after tests, audit and gate.
  If the host auto-deploys on push, add that branch to `auto_deploy_branches` in
  `gates.json` so pushes to it are gated too.
- Rollback: know how to roll back in one step, and write it down.
- Mobile: app store listings, privacy labels / data safety forms consistent with
  the privacy policy, in-app account deletion (Apple), review notes.

Output: `docs/deploy.md` — where everything runs, how to deploy, roll back and
restore, monthly cost.

## 11. Launch readiness

Not a hard gate, but walk through it before announcing the launch:
- Accessibility: WCAG 2.2 AA on key flows.
- Performance: Core Web Vitals in the green on key pages; images optimised.
- SEO and sharing: titles, descriptions, Open Graph images, sitemap, robots.txt.
- Analytics: privacy-friendly, behind consent where required, consistent with the
  privacy policy.
- Error monitoring (e.g. Sentry) with personal data scrubbed; uptime monitoring;
  alerts going to the owner.
- Friendly 404/500 pages, a support contact, transactional emails tested.

## 12. Operate

Set up and record in `project.md`:
- Automated dependency updates (Dependabot/Renovate) and who reviews them.
- A short incident playbook: how to take the site down safely, rotate keys, restore
  a backup, and notify users/regulators if data is exposed.
- Cadence: weekly look at errors and costs; monthly security re-check (baseline +
  dependency audit); quarterly restore drill and key rotation; legal review when
  features change. Offer to set these up as scheduled tasks if the agent supports it.
- Every change goes through the stages it touches and through the gates again.
