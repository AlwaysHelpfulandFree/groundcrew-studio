# Rescue audit — taking over an existing app

For an owner who arrives with code already written, often already live. The goal
is the same end state as a new build — every stage done, every gate passed —
reached by fixing what exists rather than starting over.

## 1. Make it safe to touch

- If the code isn't under git, `git init` and commit the current state as
  "baseline before Groundcrew" before changing anything. Explain why: it's the undo
  button for everything that follows.
- If code exists only on a server or in a no-code/AI builder, get a copy into a repo
  first and confirm it matches what's live.
- Set up `.groundcrew/` as in Intake, with mode = rescue.

## 2. Map what exists (read-only)

Find out, from the code and by asking the owner:
- What it does, who uses it, whether it's **live with real users and real data**.
- Stack, structure, services, where each part is hosted, how it's deployed.
- Every third-party service and SDK (these feed the legal data map).
- Where secrets live; whether any are in the code or git history.
- What tests exist and whether they run.

## 3. Stop the bleeding (only if live)

Some findings can't wait for the plan. If the app is live and you find any of these,
tell the owner immediately, explain the risk in one or two sentences, and propose
the containment step:
- Secrets exposed in the repo, frontend bundle or mobile app → rotate them now.
- Database or storage publicly readable/writable, missing row-level security,
  admin panel open → close access now.
- Auth bypass or IDOR exposing other users' data → disable the affected feature or
  take the app offline until fixed.
- Runaway costs → cap spend now.

Containment changes production, so get the owner's explicit OK for each step.
If a code fix must be deployed before the gates can pass, use the **emergency fix**
path below.

## 4. Audit against every stage

Run each stage's checklist from `stages.md` against what exists, read-only:
Product (is the scope clear?), UX (which flows break, which states are missing),
UI (default/generated look, inconsistency), Architecture (structure, SOLID
violations, data ownership, auth model), Foundation (git, Docker, env handling,
CI), QA (do the flows actually work end to end?), Security (full baseline, plus the
deep audit if available), Legal (documents present? accurate to the real data
flows?), Deploy (spend caps, backups, restore, rollback), Operate (monitoring,
updates).

Actually run the app and click through it (or drive it with a browser tool) —
reading code alone misses broken flows.

## 5. Report and fix plan

Write `.groundcrew/reports/rescue-audit.md` and walk the owner through it in plain
words. Order findings by priority:

| Priority | What | Examples |
|---|---|---|
| P0 | Live harm now | exposed secrets, open data, auth bypass with real users |
| P1 | Security and legal blockers | baseline failures, missing/false privacy policy |
| P2 | Broken core functionality | MVP flows that fail, data loss bugs |
| P3 | Structure and foundation | no Docker/Make, no tests, tangled code, hard-coded config |
| P4 | Experience | missing states, generated-looking UI, inconsistent design |

Each item: what's wrong, why it matters (one line), the fix, effort (S/M/L).
Agree the plan with the owner, then work through it with the normal stages and
gates. Record items in `project.md` → Open issues.

## 6. Restructuring toward the default architecture

Don't rewrite from scratch, and don't restructure for its own sake. Move toward the
default shape (root repo, services, Docker, Make, SOLID) incrementally, in steps
that each keep the app working: containerise first, then add the root repo and
Make, then extract services at real boundaries when there's a reason. Get the
owner's approval before any large refactor and explain what it buys them.

## Emergency fix path (live apps only)

A live app with a security or legal problem needs the fix deployed, even though the
full gates haven't passed yet — blocking the fix would leave users exposed longer.
For that case only:

1. The change contains only the fix (no features, no unrelated refactors), committed
   on its own.
2. The owner explicitly approves deploying that specific commit, after you explain
   it in plain words.
3. Record it in `gates.json`:
   ```json
   "emergency": {
     "commit": "<full commit hash>",
     "reason": "Rotates leaked Stripe key and removes it from the bundle",
     "approved_by": "<owner name>",
     "approved_at": "<date>"
   }
   ```
4. Deploy. The gate check allows exactly that commit; any later commit is blocked
   again until the gates pass. Remove the `emergency` entry after deploying.

Never use this path for a new app, for features, or to skip work the owner finds
slow.
