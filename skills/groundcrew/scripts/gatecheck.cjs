#!/usr/bin/env node
/*
 * Groundcrew gate check — zero dependencies, Node 16+.
 *
 * Decides whether a project may be deployed. A project is deployable only when
 * every gate listed in .groundcrew/gates.json under "required_for_deploy" has
 * status "passed", no passed gate has gone stale, the project is under git, and
 * there are no uncommitted code changes.
 *
 * Usage
 *   node gatecheck.cjs                 Check the project in the current directory.
 *   node gatecheck.cjs --dir <path>    Check the project at <path>.
 *   node gatecheck.cjs --json          Print the result as JSON.
 *   node gatecheck.cjs --hook          Claude Code PreToolUse hook mode: reads the
 *                                      tool call from stdin and blocks deploy
 *                                      commands (exit code 2) when gates fail.
 *
 * Exit codes (CLI mode): 0 deployable, 1 blocked, 3 not a Groundcrew project.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// Paths that never count as "code" when deciding whether a gate is stale or a
// working tree is dirty. Docs and Groundcrew's own state files can change freely.
const NON_CODE = [/\.md$/i, /^docs\//, /^\.groundcrew\//, /^LICENSE/i, /\.txt$/i];

// Commands that put code in front of real users. Kept deliberately broad: a
// false block costs the user one sentence of explanation; a false pass can cost
// them their users' data.
const DEPLOY_PATTERNS = [
  /\bwrangler\s+(deploy|publish|pages\s+deploy|versions\s+deploy)\b/,
  /\bvercel\s+(deploy\b|--prod\b|-p\b|--yes\b)/,
  /\bvercel\s*($|[;&|])/,
  /\bnetlify\s+deploy\b/,
  /\b(fly|flyctl)\s+deploy\b/,
  /\brailway\s+(up|deploy)\b/,
  /\bgit\s+push\s+heroku\b/,
  /\bfirebase\s+deploy\b/,
  /\bgcloud\s+(run\s+deploy|app\s+deploy|functions\s+deploy|builds\s+submit)\b/,
  /\baws\s+\S+\s+(deploy|update-function-code|update-service|create-deployment|start-deployment)\b/,
  /\baws\s+s3\s+sync\b/,
  /\b(sam|cdk|sls|serverless|sst)\s+deploy\b/,
  /\bamplify\s+(publish|push)\b/,
  /\b(terraform|tofu)\s+apply\b/,
  /\bpulumi\s+up\b/,
  /\bkubectl\s+(apply|create|set\s+image|rollout\s+restart)\b/,
  /\bhelm\s+(install|upgrade)\b/,
  /\bdocker\s+(push|stack\s+deploy)\b/,
  /\bssh\b.*\bdocker[\s-]+compose\b.*\bup\b/,
  /\bsupabase\s+(db\s+push|functions\s+deploy)\b/,
  /\beas\s+(submit|update)\b/,
  /\beas\s+build\b.*--profile[\s=]+prod/,
  /\bfastlane\b.*\b(release|deliver|supply|pilot|upload_to_\w+)\b/,
  /\bgh\s+workflow\s+run\b.*deploy/i,
  /\bmake\s+(deploy|release|ship)\b/,
];

function findProjectRoot(start) {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, '.groundcrew', 'gates.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function git(root, args) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trimEnd(); // keep leading spaces: porcelain status needs them
  } catch {
    return null;
  }
}

const isCode = (p) => p && !NON_CODE.some((re) => re.test(p));

function check(root) {
  const problems = [];
  let gates;
  try {
    gates = JSON.parse(fs.readFileSync(path.join(root, '.groundcrew', 'gates.json'), 'utf8'));
  } catch (e) {
    return { root, deployable: false, problems: [`.groundcrew/gates.json could not be read (${e.message}). Ask Groundcrew to repair it.`] };
  }

  const required = gates.required_for_deploy || ['qa', 'security', 'legal'];
  const isRepo = git(root, ['rev-parse', '--is-inside-work-tree']) === 'true';
  const head = isRepo ? git(root, ['rev-parse', 'HEAD']) : null;

  // Emergency fix path (live apps only): the owner approved deploying exactly
  // this commit before the gates pass. Any other commit falls through to the
  // normal checks.
  const em = gates.emergency;
  if (em && head && em.commit === head && em.approved_by && em.reason) {
    const dirty = (git(root, ['status', '--porcelain']) || '').split('\n').map((l) => l.slice(3)).filter(isCode);
    if (!dirty.length) {
      return { root, deployable: true, emergency: true, problems: [], autoDeployBranches: gates.auto_deploy_branches || [] };
    }
  }

  if (!isRepo || !head) {
    problems.push('The project is not under version control with at least one commit. Groundcrew needs git so every deploy is traceable and reversible.');
  } else {
    const dirty = (git(root, ['status', '--porcelain']) || '')
      .split('\n')
      .map((l) => l.slice(3).replace(/^.* -> /, '').replace(/^"|"$/g, ''))
      .filter(isCode);
    if (dirty.length) {
      problems.push(`There are uncommitted code changes (${dirty.slice(0, 5).join(', ')}${dirty.length > 5 ? ', …' : ''}). Commit them so the audited code is exactly what gets deployed.`);
    }
  }

  for (const name of required) {
    const g = (gates.gates || {})[name];
    if (!g) {
      problems.push(`The ${name} gate is missing from gates.json.`);
      continue;
    }
    if (g.status !== 'passed') {
      const why = g.blockers && g.blockers.length ? ` Open blockers: ${g.blockers.join('; ')}.` : '';
      problems.push(`The ${name} gate is ${g.status || 'not started'}.${why}`);
      continue;
    }
    if (name === 'legal' && !g.signed_off_by) {
      problems.push('The legal gate is marked passed but has no recorded sign-off from the project owner.');
    }
    if (g.stale_on_code_change !== false && head && g.commit && g.commit !== head) {
      const changed = (git(root, ['diff', '--name-only', g.commit, head]) || '').split('\n').filter(isCode);
      if (changed.length) {
        problems.push(`The ${name} gate passed on an older commit, and code has changed since (${changed.slice(0, 5).join(', ')}${changed.length > 5 ? ', …' : ''}). It needs a re-check.`);
      }
    }
    if (g.status === 'passed' && g.stale_on_code_change !== false && !g.commit) {
      problems.push(`The ${name} gate is marked passed without the commit it was checked against.`);
    }
  }
  return { root, deployable: problems.length === 0, problems, autoDeployBranches: gates.auto_deploy_branches || [] };
}

function isDeployCommand(cmd, root, autoDeployBranches) {
  if (DEPLOY_PATTERNS.some((re) => re.test(cmd))) return true;
  // A push to a branch the host deploys automatically is a deploy too.
  const m = cmd.match(/\bgit\s+push\b([^;&|]*)/);
  if (m && autoDeployBranches.length) {
    const args = m[1].trim().split(/\s+/).filter((a) => a && !a.startsWith('-'));
    const refspecs = args.slice(1);
    const targets = refspecs.length
      ? refspecs.map((r) => r.split(':').pop().replace(/^refs\/heads\//, ''))
      : [git(root, ['rev-parse', '--abbrev-ref', 'HEAD'])];
    return targets.some((t) => autoDeployBranches.includes(t));
  }
  return false;
}

function blockMessage(result) {
  return [
    'Groundcrew blocked this deploy. The project has not cleared its launch gates:',
    ...result.problems.map((p) => `  - ${p}`),
    '',
    'Explain this to the user in plain words, then offer to work through the open items (run the Groundcrew QA, security or legal stage as needed). Do not try another deploy command or edit gates.json to get around this; a gate is only passed by doing the stage.',
  ].join('\n');
}

function hookMode() {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (c) => (raw += c));
  process.stdin.on('end', () => {
    let input;
    try {
      input = JSON.parse(raw);
    } catch {
      process.exit(0); // Never break the session over malformed hook input.
    }
    const cmd = input && input.tool_input && input.tool_input.command;
    if (!cmd) process.exit(0);
    const root = findProjectRoot(input.cwd || process.cwd());
    if (!root) process.exit(0); // Not a Groundcrew project: stay out of the way.
    const result = check(root);
    if (!isDeployCommand(cmd, root, result.autoDeployBranches || [])) process.exit(0);
    if (result.deployable) process.exit(0);
    process.stderr.write(blockMessage(result) + '\n');
    process.exit(2);
  });
}

function cliMode(argv) {
  const dirIdx = argv.indexOf('--dir');
  const start = dirIdx >= 0 ? argv[dirIdx + 1] : process.cwd();
  const root = findProjectRoot(start);
  if (!root) {
    console.log('No .groundcrew/gates.json found here or in any parent folder. This is not a Groundcrew project yet.');
    process.exit(3);
  }
  const result = check(root);
  if (argv.includes('--json')) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.emergency) {
    console.log('Emergency fix approved for this exact commit. Deploy it, then remove the "emergency" entry from gates.json.');
  } else if (result.deployable) {
    console.log('All launch gates passed. This project may be deployed.');
  } else {
    console.log(blockMessage(result));
  }
  process.exit(result.deployable ? 0 : 1);
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  if (argv.includes('--hook')) hookMode();
  else cliMode(argv);
}

module.exports = { check, isDeployCommand, findProjectRoot, DEPLOY_PATTERNS };
