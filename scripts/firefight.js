const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ─── CLI ──────────────────────────────────────────────────────────

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i].startsWith('--')) {
    const key = process.argv[i].slice(2);

    // Support repeatable --headers by collecting into array
    if (key === 'headers') {
      if (!args.headers) args.headers = [];
      args.headers.push(process.argv[++i]);
      continue;
    }

    const next = process.argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) {
      args[key] = process.argv[++i];
    } else {
      args[key] = true;
    }
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

// ─── Execute Payload (robusto) ────────────────────────────────────

function execute(target, opts = {}) {
  const {
    payload,
    method = 'GET',
    param,
    headers = [],
    body,
    contentType,
    cookie,
    agent,
    playground,
    raw,
  } = opts;

  const m = method.toUpperCase();
  const parts = ['curl', '-s', '-k', '-L', '--max-time', '15'];

  // Method
  if (m !== 'GET') parts.push('-X', m);

  // Headers
  for (const h of headers) {
    parts.push('-H', h.replace(/'/g, "\\'"));
  }
  if (contentType) parts.push('-H', `Content-Type: ${contentType}`);
  if (cookie) parts.push('-H', `Cookie: ${cookie}`);
  if (agent) parts.push('-H', `User-Agent: ${agent}`);

  // Body or param injection
  // URL
  let urlAdded = false;

  if (body) {
    parts.push('-d', body);
    parts.push(`'${target}'`);
    urlAdded = true;
  } else if (payload && param) {
    // Inject payload into query param
    const url = new URL(target);
    url.searchParams.set(param, payload);
    parts.push(`'${url.toString()}'`);
  } else if (payload && m === 'POST') {
    parts.push('-d', `${param || 'input'}=${encodeURIComponent(payload)}`);
    parts.push(`'${target}'`);
  } else {
    parts.push(`'${target}'`);
  }

  // Output control
  if (!raw && !playground) {
    parts.push('-w', '\\nHTTP_CODE:%{http_code}|SIZE:%{size_download}|TIME:%{time_total}');
  }

  const cmd = parts.join(' ');

  try {
    const output = execSync(cmd, { timeout: 17000, encoding: 'utf8', maxBuffer: 1024 * 500 });

    if (playground) {
      return {
        status: 'playground',
        curl_command: cmd.replace(/'/g, ''),
        response: {
          http_code: extractCode(output),
          body: output.substring(0, 12000),
          size: output.length,
        },
        prompt_template: `Payload executed against ${target} [${m}]. HTTP: ${extractCode(output)} | Body: ${output.length} bytes | ${path.basename(target)}.\nDoes this look like a successful exploitation? Respond with: EXPLOIT_WORKED, EXPLOIT_FAILED, or EXPLOIT_UNCERTAIN.`,
      };
    }

    return {
      status: 'done',
      output: output.substring(0, 12000),
      metadata: extractMetadata(output),
    };
  } catch (e) {
    return { status: 'error', error: e.message.substring(0, 500) };
  }
}

function extractCode(output) {
  const m = output.match(/HTTP_CODE:(\d+)/);
  return m ? m[1] : 'unknown';
}

function extractMetadata(output) {
  const m = output.match(/HTTP_CODE:(\d+)\|SIZE:([^|]+)\|TIME:([^\s]+)/);
  return m ? { http_code: m[1], size: m[2], time: m[3] } : { http_code: 'unknown' };
}

// ─── Chain Proposal ───────────────────────────────────────────────

function chainProposal(finding) {
  let parsed;
  try {
    parsed = typeof finding === 'string' ? JSON.parse(finding) : finding;
  } catch {
    return { error: 'Invalid --finding JSON' };
  }

  const vulnClass = parsed.class;
  const technique = parsed.technique;
  if (!vulnClass) return { error: 'finding.class is required' };

  // Load the same-class skill
  const skill = loadSkill(vulnClass);
  const otherTechniques = skill
    ? Object.keys(skill.techniques).filter(t => t !== technique)
    : [];

  // Search for cross-class chain opportunities
  const allClasses = fs.readdirSync(SKILL_DIR).filter(f =>
    fs.statSync(path.join(SKILL_DIR, f)).isDirectory()
  );

  const crossClass = allClasses
    .filter(c => c !== vulnClass)
    .map(c => ({ class: c, techniques: Object.keys(loadSkill(c)?.techniques || {}) }));

  return {
    status: 'chain_proposal',
    current: { class: vulnClass, technique, severity: parsed.severity || 'unknown' },
    same_class_chains: otherTechniques.map(t => ({
      technique: t,
      question: `After ${technique}, can you chain with ${t} in the same class?`,
    })),
    cross_class_chains: crossClass.map(c => ({
      class: c.class,
      techniques: c.techniques,
      question: `Can ${technique} (${vulnClass}) chain with any ${c.class} technique?`,
    })),
    strategist_prompt: `Confirmed finding: ${vulnClass}/${technique} (severity: ${parsed.severity}).\nAvailable techniques in same class: ${otherTechniques.join(', ') || 'none'}\nCross-class options: ${crossClass.map(c => c.class).join(', ') || 'none'}\n\nWhat is the best chain? Recommend only 1-2 techniques max. Output as JSON: {"chains":[{"technique":"...","class":"...","reason":"..."}]}`,
  };
}

// ─── Main ─────────────────────────────────────────────────────────

function main() {
  const mode = args.mode || args._?.[0] || 'help';

  // ── help ────────────────────────────────────────────────────
  if (mode === 'help' || args.help) {
    console.log(JSON.stringify({
      commands: {
        skill: 'Show skill techniques. Usage: --mode skill --class xss',
        list: 'List all available skills',
        exec: 'Execute a payload. Usage: --mode exec --target <url> [options]',
        chain: 'Propose attack chains from a confirmed finding. Usage: --mode chain --finding \'{"class":"cors","technique":"wildcard-credentials","severity":"high"}\'',
      },
      exec_options: {
        '--target': 'Target URL (required)',
        '--method': 'HTTP method (default: GET)',
        '--payload': 'Payload string',
        '--param': 'Query parameter name',
        '--body': 'Request body for POST/PUT/PATCH',
        '--type': 'Content-Type override',
        '--headers': 'Repeatable: --headers "X: a" --headers "Y: b"',
        '--cookie': 'Cookie header value',
        '--agent': 'User-Agent override',
        '--playground': 'Show full curl command + output + prompt template',
        '--raw': 'Return full response body (no metadata suffix)',
      },
      notes: 'Firefight debates are run by the opencode agent using @mentions to subagents in .opencode/agents/',
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
      technique_details: skill.techniques,
    }, null, 2));
    return;
  }

  // ── exec (robusto) ──────────────────────────────────────────
  if (mode === 'exec') {
    const target = args.target;
    if (!target) {
      console.log(JSON.stringify({ error: '--target is required' }));
      process.exit(1);
    }

    const result = execute(target, {
      payload: args.payload,
      method: args.method,
      param: args.param,
      headers: args.headers || [],
      body: args.body,
      contentType: args.type,
      cookie: args.cookie,
      agent: args.agent,
      playground: args.playground,
      raw: args.raw,
    });

    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // ── chain ───────────────────────────────────────────────────
  if (mode === 'chain') {
    if (!args.finding) {
      console.log(JSON.stringify({ error: '--finding is required (JSON string)' }));
      process.exit(1);
    }

    const result = chainProposal(args.finding);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(JSON.stringify({ error: `Unknown mode '${mode}'. Use --mode help` }));
}

main();
