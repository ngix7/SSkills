const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ─── CLI ──────────────────────────────────────────────────────────

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i].startsWith('--')) {
    const key = process.argv[i].slice(2);
    args[key] = process.argv[++i] || true;
  }
}

// ─── Skill Loading ────────────────────────────────────────────────

const SKILL_DIR = path.join(__dirname, '..', 'skills');

function loadSkill(vulnClass) {
  const base = path.join(SKILL_DIR, vulnClass);
  if (!fs.existsSync(base)) return null;

  const router = fs.existsSync(path.join(base, 'router.md'))
    ? fs.readFileSync(path.join(base, 'router.md'), 'utf8') : '';

  const techDir = path.join(base, 'techniques');
  let techniques = {};
  if (fs.existsSync(techDir)) {
    const files = fs.readdirSync(techDir).filter(f => f.endsWith('.md') && f !== 'index.md');
    for (const f of files) {
      const name = f.replace('.md', '');
      techniques[name] = fs.readFileSync(path.join(techDir, f), 'utf8').substring(0, 3000);
    }
  }

  return { router, techniques };
}

// ─── Execute Payload ──────────────────────────────────────────────

function execute(target, payload, method, param, header) {
  const url = new URL(target);
  const m = (method || 'GET').toUpperCase();
  const p = payload || '';
  const h = header || '';

  let cmd;
  if (h) {
    // Custom header mode (e.g., CORS Origin testing)
    cmd = `curl -s -H '${h.replace(/'/g, "\\'")}' '${target}' -m 15 -o /dev/null -w 'HTTP %{http_code} | Size: %{size_download} | Time: %{time_total}s'`;
  } else if (m === 'POST') {
    cmd = `curl -s -X POST '${target}' -d '${param}=${encodeURIComponent(p)}' -m 15`;
  } else if (param) {
    url.searchParams.set(param, p);
    cmd = `curl -s '${url.toString()}' -m 15`;
  } else {
    cmd = `curl -s '${target}' -m 15`;
  }

  try {
    const output = execSync(cmd, { timeout: 17000, encoding: 'utf8', maxBuffer: 1024 * 500 });
    return { success: true, output: output.substring(0, 8000) };
  } catch (e) {
    return { success: false, error: e.message.substring(0, 500) };
  }
}

// ─── Main ─────────────────────────────────────────────────────────

function main() {
  const mode = args.mode || args._?.[0] || 'help';

  // ── help ────────────────────────────────────────────────────
  if (mode === 'help' || args.help) {
    console.log(JSON.stringify({
      commands: {
        skill: 'Show skill techniques for a vulnerability class. Usage: --mode skill --class xss',
        exec: 'Execute a payload. Usage: --mode exec --target <url> --payload <payload> [--method GET --param name --header "Origin: https://x.com"]',
        list: 'List all available skills'
      },
      notes: 'Firefight debates are run by the opencode agent using @mentions to subagents in .opencode/agents/'
    }, null, 2));
    return;
  }

  // ── list ────────────────────────────────────────────────────
  if (mode === 'list') {
    const skills = fs.readdirSync(SKILL_DIR).filter(f =>
      fs.statSync(path.join(SKILL_DIR, f)).isDirectory()
    ).sort();
    const result = {};
    for (const s of skills) {
      const skill = loadSkill(s);
      if (skill) {
        result[s] = { techniques: Object.keys(skill.techniques) };
      }
    }
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // ── skill ───────────────────────────────────────────────────
  if (mode === 'skill') {
    const vulnClass = args.class;
    if (!vulnClass) {
      console.log(JSON.stringify({ error: '--class is required' }));
      process.exit(1);
    }
    const skill = loadSkill(vulnClass);
    if (!skill) {
      console.log(JSON.stringify({ error: `Skill '${vulnClass}' not found` }));
      process.exit(1);
    }
    console.log(JSON.stringify({
      class: vulnClass,
      router_summary: (skill.router || '').substring(0, 2000),
      techniques: Object.keys(skill.techniques),
      technique_details: skill.techniques
    }, null, 2));
    return;
  }

  // ── exec ────────────────────────────────────────────────────
  if (mode === 'exec') {
    const target = args.target;
    const payload = args.payload;
    const method = args.method || 'GET';
    const param = args.param;

    if (!target || (!payload && !args.header)) {
      console.log(JSON.stringify({ error: '--target and --payload (or --header) are required' }));
      process.exit(1);
    }

    const header = args.header;
    const result = execute(target, payload, method, param, header);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(JSON.stringify({ error: 'Unknown mode. Use --mode help' }));
}

main();
