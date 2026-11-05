#!/usr/bin/env node
'use strict';
// groundcrew-studio CLI: thin wrapper so the skill and its gate are one `npx` away.
const { spawnSync } = require('child_process');
const path = require('path');

const REPO = 'AlwaysHelpfulandFree/groundcrew-studio';
const [cmd, ...rest] = process.argv.slice(2);
const run = (bin, args) => process.exit(spawnSync(bin, args, { stdio: 'inherit', shell: process.platform === 'win32' }).status ?? 1);

switch (cmd) {
  case 'install': // The Skills CLI knows where every agent keeps its skills.
    run('npx', ['-y', 'skills', 'add', REPO, ...rest]);
    break;
  case 'gate':
    run(process.execPath, [path.join(__dirname, '..', 'skills', 'groundcrew', 'scripts', 'gatecheck.cjs'), ...rest]);
    break;
  default:
    console.log(`groundcrew-studio — idea to safe launch, with hard gates.

  npx groundcrew-studio install [skills-cli options]   Install the Groundcrew skill for your coding agents
  npx groundcrew-studio gate [--dir <path>] [--json]   Check whether a project may be deployed

Claude Code plugin (adds the deploy-blocking hook):
  /plugin marketplace add ${REPO}
  /plugin install groundcrew-studio@groundcrew-studio`);
    process.exit(cmd ? 1 : 0);
}
