# Tidy — Groundcrew project file

## Snapshot
- **What it is:** Booking app for home-cleaning services in Manchester
- **Mode:** new build
- **Owner's comfort with tech:** some
- **Current stage:** QA — end-to-end runs in progress
- **Next step:** fix password reset flow (reset link never arrives), then re-run QA

## Stage progress
| Stage | Status | Output |
|---|---|---|
| Intake | done | |
| Product | done | docs/product.md |
| UX | done | docs/ux-flows.md |
| UI | done | docs/design-system.md |
| Architecture | done | docs/architecture.md |
| Foundation | done | |
| Build | done | |
| QA (gate) | in progress | |
| Security (gate) | not started | |
| Legal (gate) | not started | |
| Deploy | not started | |

## Decisions
- 2026-10-20 — Next.js + NestJS + Postgres — default, owner agreed
- 2026-10-21 — Stripe for payments — owner chose

## Open issues
- High: password reset email never sent (email provider not configured)
- Medium: booking cancellation shows a blank screen on error
- Legal: collects home addresses and phone numbers of UK customers; no privacy policy yet
