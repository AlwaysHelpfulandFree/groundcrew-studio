# Non-negotiables

These hold in every stage, stack and mode. Each comes with its reason so you can
apply it to situations this file doesn't list, and explain it to the owner.

## 1. Tokens never touch frontend code

**Why:** anything JavaScript can read, an attacker's injected JavaScript can read.
One XSS bug (or one compromised npm package) and every user's session is stolen.
Cookies marked `HttpOnly` are invisible to JavaScript, so the same bug can't steal them.

Web:
- The frontend never receives, stores or handles a token. It makes requests; the
  browser attaches the session cookie.
- Never in localStorage, sessionStorage, IndexedDB, JS variables/state, URLs,
  query strings, response bodies, logs, error reports or analytics.
- Session cookie: `HttpOnly; Secure; SameSite=Lax` (or `Strict`), `Path=/`, and the
  `__Host-` name prefix where the setup allows (it forces Secure, Path=/ and no
  Domain).
- Short-lived sessions with server-side expiry; refresh by rotation; logout and
  password change invalidate sessions on the server.
- Single-page apps talking to a separate API: use a backend-for-frontend (BFF) or
  same-site API so cookies work; don't fall back to bearer tokens in JS.
- Third-party sign-in (Google, GitHub, etc.): authorisation code flow with PKCE,
  handled by the backend; provider tokens stay server-side (encrypted at rest if
  stored); the browser only ever gets the app's own session cookie.

CSRF — the trade-off of cookies: because the browser sends them automatically,
every state-changing request (POST/PUT/PATCH/DELETE) needs protection: SameSite
cookies **plus** a CSRF token or a strict Origin/Fetch-Metadata check. GET requests
never change state.

Mobile (no browser cookie jar):
- Tokens only in the OS secure store: iOS Keychain, Android Keystore (e.g.
  `expo-secure-store`, `flutter_secure_storage`). Never AsyncStorage,
  SharedPreferences, plain files or app logs.
- Short-lived access tokens, rotating refresh tokens with reuse detection,
  server-side revocation.
- OAuth on mobile uses the system browser with PKCE, never an embedded webview
  that can read credentials.

If an existing app violates this, fixing it is a security-gate blocker.

## 2. Authorisation on the server, every request, every object

**Why:** the most common real-world breach in generated apps is "change the ID in
the URL and see someone else's data" (IDOR). Hiding a button in the UI doesn't
stop a direct request.

- Every endpoint checks: is there a valid session, and is *this* user allowed *this*
  action on *this* specific record (ownership or role)?
- Put the check in one reusable place (a policy/guard class) so it can't be forgotten.
- Database exposed to clients (e.g. Supabase)? Row-level security on every table,
  tested with two users.
- Admin and internal tools are separately protected and never assume "nobody knows
  the URL".

## 3. Secrets live in secret stores only

**Why:** bots scan public repos and app bundles for keys within minutes. A leaked
payment or AI key can run up thousands in charges overnight.

- Never in source code, git history, frontend bundles, mobile binaries, screenshots
  or the chat. `.env` is git-ignored; `.env.example` has names only.
- Anything prefixed for the frontend (`NEXT_PUBLIC_`, `VITE_`, `EXPO_PUBLIC_`…) is
  public. Only publishable keys go there.
- A secret that was ever committed is compromised: rotate it, then clean history.
- Least privilege: separate keys per environment and service, scoped to what they need.
- Never ask the owner to paste a secret into the conversation. Show them where to
  put it.

## 4. Version control from the first file

**Why:** without history there's no undo, no audit trail, and no way to know what's
actually deployed. The gate check depends on it.

- `git init` before writing code. Small commits with clear messages.
- Never commit generated build output, dependencies or secrets.
- The deployed code is always a specific committed version.

## 5. Spend is capped before anything can bill

**Why:** surprise bills — runaway serverless loops, abused AI endpoints, egress
fees — kill more indie projects than hackers do.

- Budget alerts and hard caps where the provider supports them, on every account,
  before first deploy.
- Per-user rate limits on anything that costs money per call (AI, SMS, email, maps).

## 6. Collect less personal data

**Why:** data you don't hold can't leak, and every field collected is a legal duty.

- Collect only what an MVP flow needs; say why in the data map.
- No real user data in development or test environments.
- Log events, not people: no passwords, tokens, full card numbers or unnecessary
  personal details in logs or analytics.

## 7. No design that reads as generated

**Why:** users (and investors) now recognise default AI-generated styling instantly,
and read it as "low effort, possibly unsafe". A product that looks like its
audience's own thing earns trust.

- Every visual decision traces to the brand, audience or content, never to a
  default. Themed design tokens, not library defaults.
- Real copy in the brand's voice; no filler, no invented testimonials or stats.
- See the UI section of `stages.md` for the process and common tells.

## 8. Honesty with the owner

**Why:** the owner is accountable for what goes live, so they must know its true state.

- Never claim "unhackable", "fully compliant" or "legally safe". Say what was
  checked and what remains a risk.
- Never mark a gate passed that hasn't been earned; never hide a finding.
- Legal drafts are drafts, not legal advice; high-risk categories need a lawyer.
