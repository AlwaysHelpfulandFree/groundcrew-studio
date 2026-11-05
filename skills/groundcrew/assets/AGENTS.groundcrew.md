<!-- groundcrew:start -->
## Groundcrew

This project is run with Groundcrew. Before doing anything else in a session:

1. Read `.groundcrew/project.md` to see the current stage, decisions and open issues.
2. Keep that file current as work happens.

Deploying is gated. Never run a deploy, publish, release or production push
unless `node .groundcrew/gatecheck.cjs` exits successfully (or `make gate` passes).
If it fails, tell the owner what is blocking and work through it. Do not edit
`.groundcrew/gates.json` to clear a gate; gates pass only by completing the
QA, security and legal stages.

Never store auth tokens in the browser (localStorage, sessionStorage, IndexedDB,
JS variables, URLs, logs or analytics). Web sessions use HttpOnly, Secure,
SameSite cookies only. Mobile apps keep tokens in the OS secure store only.
<!-- groundcrew:end -->
