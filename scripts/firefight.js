const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ─── CLI ──────────────────────────────────────────────────────────

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i].startsWith('--')) {
    const key = process.argv[i].slice(2);

    if (key === 'headers') {
      if (!args.headers) args.headers = [];
      args.headers.push(process.argv[++i]);
      continue;
    }
    if (key === 'rounds') {
      if (!args.rounds) args.rounds = [];
      args.rounds.push(process.argv[++i]);
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

// ─── Protocol detection ───────────────────────────────────────────

function detectProtocol(target, explicit) {
  if (explicit && explicit !== 'auto') return explicit;
  if (target.startsWith('ws://') || target.startsWith('wss://')) return 'ws';
  if (!target.startsWith('http://') && !target.startsWith('https://') && !target.startsWith('ws')) return 'dns';
  return 'http';
}

// ─── HTTP helper (used by execute + probe) ────────────────────────

function curl(method, url, opts = {}) {
  const parts = ['curl', '-s', '-k', '-L', '--max-time', '15'];
  if (method !== 'GET') parts.push('-X', method);
  if (opts.headers) {
    for (const h of opts.headers) {
      parts.push('-H', h.replace(/'/g, "\\'"));
    }
  }
  if (opts.body) parts.push('-d', opts.body);
  parts.push('-D', '-');
  parts.push(`'${url}'`);
  if (!opts.noWriteOut) {
    parts.push('-w', "'\\nHTTP_CODE:%{http_code}|SIZE:%{size_download}|TIME:%{time_total}'");
  }

  const cmd = parts.join(' ');
  try {
    const output = execSync(cmd, { timeout: 17000, encoding: 'utf8', maxBuffer: 1024 * 500 });
    // Headers are EVERYTHING before the last HTTP_CODE metadata line
    const metaIdx = output.lastIndexOf('\nHTTP_CODE:');
    const headerSection = metaIdx >= 0 ? output.slice(0, metaIdx) : output;
    const body = headerSection.replace(/^[\s\S]*?\n\n/s, '').split('\nHTTP_CODE:')[0].trim();
    const httpCode = output.match(/HTTP_CODE:(\d+)/)?.[1] || 'unknown';
    // Search the entire headerSection for ACA-Origin (any response, even from redirects)
    return { cmd, rawHeaders: headerSection, body: body.substring(0, 3000), httpCode, output: output.substring(0, 12000) };
  } catch (e) {
    return { cmd, error: e.message.substring(0, 300) };
  }
}

// ─── Execute Payload ──────────────────────────────────────────────

function execute(target, opts = {}) {
  const {
    payload, method = 'GET', param, headers = [], body, contentType,
    cookie, agent, playground, raw, protocol: explicitProtocol,
    dnsType = 'A', dnsServer,
  } = opts;

  const protocol = detectProtocol(target, explicitProtocol);
  const m = method.toUpperCase();

  // WebSocket
  if (protocol === 'ws') {
    const cmd = payload
      ? `echo '${payload.replace(/'/g, "'\\''")}' | wscat -c '${target}' -w 5 2>&1`
      : `wscat -c '${target}' -w 5 2>&1`;
    try {
      const output = execSync(cmd, { timeout: 17000, encoding: 'utf8', maxBuffer: 1024 * 500 });
      const result = { protocol: 'ws', command: cmd, output: output.substring(0, 12000) };
      if (playground) {
        return { status: 'playground', ...result, prompt_template: `WebSocket ${target} sent. Response: ${output.length}b.\nDoes this indicate a vulnerability? EXPLOIT_WORKED / EXPLOIT_FAILED / EXPLOIT_UNCERTAIN` };
      }
      return { status: 'done', ...result };
    } catch (e) {
      return { status: 'error', protocol: 'ws', error: e.message.substring(0, 500) };
    }
  }

  // DNS
  if (protocol === 'dns') {
    const query = dnsServer ? `@${dnsServer}` : '';
    const cmd = `dig ${query} '${target}' ${dnsType} +short 2>&1`;
    try {
      const output = execSync(cmd, { timeout: 10000, encoding: 'utf8', maxBuffer: 1024 * 100 });
      const result = { protocol: 'dns', command: cmd, records: output.trim().split('\n').filter(Boolean), raw: output.substring(0, 2000) };
      if (playground) {
        return { status: 'playground', ...result, prompt_template: `DNS ${dnsType} lookup for ${target}: ${result.records.length} records.\nDoes this reveal anything useful? EXPLOIT_WORKED / EXPLOIT_FAILED / EXPLOIT_UNCERTAIN` };
      }
      return { status: 'done', ...result };
    } catch (e) {
      return { status: 'error', protocol: 'dns', error: e.message.substring(0, 500) };
    }
  }

  // HTTP
  const parts = ['curl', '-s', '-k', '-L', '--max-time', '15'];
  if (m !== 'GET') parts.push('-X', m);
  for (const h of headers) parts.push('-H', h.replace(/'/g, "\\'"));
  if (contentType) parts.push('-H', `Content-Type: ${contentType}`);
  if (cookie) parts.push('-H', `Cookie: ${cookie}`);
  if (agent) parts.push('-H', `User-Agent: ${agent}`);
  if (body) { parts.push('-d', body); parts.push(`'${target}'`); }
  else if (payload && param) { const url = new URL(target); url.searchParams.set(param, payload); parts.push(`'${url.toString()}'`); }
  else if (payload && m === 'POST') { parts.push('-d', `${param || 'input'}=${encodeURIComponent(payload)}`); parts.push(`'${target}'`); }
  else { parts.push(`'${target}'`); }
  if (!raw && !playground) parts.push('-w', "'\\nHTTP_CODE:%{http_code}|SIZE:%{size_download}|TIME:%{time_total}'");

  const cmd = parts.join(' ');
  try {
    const output = execSync(cmd, { timeout: 17000, encoding: 'utf8', maxBuffer: 1024 * 500 });
    const httpCode = output.match(/HTTP_CODE:(\d+)/)?.[1] || 'unknown';
    const meta = output.match(/HTTP_CODE:(\d+)\|SIZE:([^|]+)\|TIME:([^\s]+)/);
    if (playground) {
      return { status: 'playground', protocol: 'http', command: cmd.replace(/'/g, ''), response: { http_code: httpCode, body: output.substring(0, 12000), size: output.length }, prompt_template: `HTTP ${m} ${target} -> ${httpCode} | ${output.length}b.\nExploitation successful? EXPLOIT_WORKED / EXPLOIT_FAILED / EXPLOIT_UNCERTAIN` };
    }
    return { status: 'done', protocol: 'http', output: output.substring(0, 12000), metadata: meta ? { http_code: meta[1], size: meta[2], time: meta[3] } : { http_code: httpCode } };
  } catch (e) {
    return { status: 'error', protocol: 'http', error: e.message.substring(0, 500) };
  }
}

// ─── Probe ─────────────────────────────────────────────────────────

function probe(target) {
  const base = target.replace(/\/+$/, '');
  const result = { target, cors: {}, public_endpoints: [], summary: {} };

  // 1. OPTIONS preflight on root + /api
  for (const ep of ['/', '/api', '/api/Users', '/rest/user/login']) {
    const url = `${base}${ep}`;
    const r = curl('OPTIONS', url, { headers: ['Origin: https://evil.com', 'Access-Control-Request-Method: GET'] });
    if (r.error) { result.cors[ep] = { error: r.error }; continue; }
    const h = r.rawHeaders.toLowerCase();
    const corsInfo = {
      aca_origin: (h.match(/access-control-allow-origin:\s*(\S+)/i) || [])[1] || null,
      aca_methods: (h.match(/access-control-allow-methods:\s*(.+)/i) || [])[1] || null,
      aca_headers: (h.match(/access-control-allow-headers:\s*(.+)/i) || [])[1] || null,
      aca_credentials: (h.match(/access-control-allow-credentials:\s*(\S+)/i) || [])[1] || null,
      http_code: r.httpCode,
    };
    result.cors[ep] = corsInfo;
    if (ep === '/api' || ep === '/') { result.cors.preflight = corsInfo; }
  }

  // 2. Origin reflection test
  const refUrl = `${base}/api`;
  const ref = curl('GET', refUrl, { headers: ['Origin: https://evil.com'] });
  if (!ref.error) {
    const h = ref.rawHeaders.toLowerCase();
    result.cors.origin_reflection = (h.match(/access-control-allow-origin:\s*(\S+)/i) || [])[1] || null;
    result.cors.origin_reflection_match = result.cors.origin_reflection === 'https://evil.com';
  }

  // 3. Public endpoint accessibility (cross-origin, no auth)
  const publicCandidates = ['/api/Challenges', '/api/Products', '/rest/continue-code'];
  for (const ep of publicCandidates) {
    const url = `${base}${ep}`;
    const r = curl('GET', url, { headers: ['Origin: https://evil.com'] });
    if (r.error) { result.public_endpoints.push({ path: ep, error: r.error }); continue; }
    const h = r.rawHeaders.toLowerCase();
    result.public_endpoints.push({
      path: ep,
      http_code: r.httpCode,
      aca_origin: (h.match(/access-control-allow-origin:\s*(\S+)/i) || [])[1] || null,
      body_preview: r.body.substring(0, 200),
      size: r.body.length,
      has_data: r.body.length > 100 && !r.body.includes('<html'),
    });
  }

  // 4. Preflight with Authorization header
  const authUrl = `${base}/api/Users`;
  const authPre = curl('OPTIONS', authUrl, { headers: ['Origin: https://evil.com', 'Access-Control-Request-Method: GET', 'Access-Control-Request-Headers: authorization'] });
  if (!authPre.error) {
    const h = authPre.rawHeaders.toLowerCase();
    result.cors.preflight_with_auth = {
      aca_origin: (h.match(/access-control-allow-origin:\s*(\S+)/i) || [])[1] || null,
      aca_headers: (h.match(/access-control-allow-headers:\s*(.+)/i) || [])[1] || null,
      http_code: authPre.httpCode,
    };
  }

  // Summary
  const hasWildcard = Object.values(result.cors).some(v => v && v.aca_origin === '*');
  const hasReflection = result.cors.origin_reflection_match === true;
  const hasAuthHeader = result.cors.preflight_with_auth?.aca_headers?.includes('authorization');
  const publicWithData = result.public_endpoints.filter(e => e.has_data);
  result.summary = {
    cors_wildcard: hasWildcard,
    cors_origin_reflection: hasReflection,
    preflight_allows_auth_header: hasAuthHeader,
    public_endpoints_with_data: publicWithData.map(e => e.path),
  };

  return result;
}

// ─── History Compressor ────────────────────────────────────────────

function compressHistory(rounds) {
  const parsed = rounds.map(r => {
    if (typeof r === 'string') {
      try { return JSON.parse(r); } catch { return { agent: 'unknown', text: r }; }
    }
    return r;
  });

  const lines = [];
  for (const r of parsed) {
    const agent = r.agent || r.role || 'unknown';
    const text = r.text || r.response || r.content || JSON.stringify(r);
    const summary = text
      .replace(/```[\s\S]*?```/g, '(code block)')
      .replace(/\n{2,}/g, '\n')
      .split('\n')
      .filter(l => l.trim())
      .slice(0, 5)
      .join('; ');
    lines.push(`[${agent}] ${summary.substring(0, 400)}`);
  }

  return {
    compressed: true,
    rounds: lines,
    prompt_template: lines.map((l, i) => `Round ${i + 1}: ${l}`).join('\n'),
    total_chars: lines.reduce((a, l) => a + l.length, 0),
  };
}

// ─── Chain Proposal ───────────────────────────────────────────────

function chainProposal(finding) {
  let parsed;
  try { parsed = typeof finding === 'string' ? JSON.parse(finding) : finding; }
  catch { return { error: 'Invalid --finding JSON' }; }

  const vulnClass = parsed.class;
  const technique = parsed.technique;
  if (!vulnClass) return { error: 'finding.class is required' };

  const skill = loadSkill(vulnClass);
  const otherTechniques = skill ? Object.keys(skill.techniques).filter(t => t !== technique) : [];

  const allClasses = fs.readdirSync(SKILL_DIR).filter(f => fs.statSync(path.join(SKILL_DIR, f)).isDirectory());
  const crossClass = allClasses.filter(c => c !== vulnClass).map(c => ({ class: c, techniques: Object.keys(loadSkill(c)?.techniques || {}) }));

  return {
    status: 'chain_proposal',
    current: { class: vulnClass, technique, severity: parsed.severity || 'unknown' },
    same_class_chains: otherTechniques.map(t => ({ technique: t, question: `After ${technique}, can you chain with ${t} in the same class?` })),
    cross_class_chains: crossClass.map(c => ({ class: c.class, techniques: c.techniques, question: `Can ${technique} (${vulnClass}) chain with any ${c.class} technique?` })),
    strategist_prompt: `Confirmed finding: ${vulnClass}/${technique} (severity: ${parsed.severity}).\nAvailable techniques in same class: ${otherTechniques.join(', ') || 'none'}\nCross-class options: ${crossClass.map(c => c.class).join(', ') || 'none'}\n\nWhat is the best chain? Recommend only 1-2 techniques max. Output as JSON: {"chains":[{"technique":"...","class":"...","reason":"..."}]}`,
  };
}

// ─── Main ─────────────────────────────────────────────────────────

function main() {
  const mode = args.mode || args._?.[0] || 'help';

  if (mode === 'help' || args.help) {
    console.log(JSON.stringify({
      commands: {
        skill: 'Show skill techniques. Usage: --mode skill --class xss',
        list: 'List all available skills',
        exec: 'Execute a payload. Usage: --mode exec --target <url> [options]',
        chain: 'Propose attack chains from a confirmed finding. Usage: --mode chain --finding \'{"class":"cors","technique":"wildcard-credentials","severity":"high"}\'',
        probe: 'Probe target for CORS config and public endpoints. Usage: --mode probe --target <url>',
        compress: 'Compress debate history for compact prompts. Usage: --mode compress --rounds \'{"agent":"opt","text":"..."}\' --rounds \'{"agent":"skep","text":"..."}\'',
      },
      exec_options: {
        '--target': 'Target URL or domain (required)', '--method': 'HTTP method (default: GET)',
        '--payload': 'Payload string', '--param': 'Query parameter name',
        '--body': 'Request body for POST/PUT/PATCH', '--type': 'Content-Type override',
        '--headers': 'Repeatable: --headers "X: a" --headers "Y: b"',
        '--cookie': 'Cookie header value', '--agent': 'User-Agent override',
        '--protocol': 'Force protocol: auto (default), http, ws, dns',
        '--dns-type': 'DNS record type: A, AAAA, TXT, CNAME, MX, NS (default: A)',
        '--dns-server': 'Custom DNS server (dig @server)',
        '--playground': 'Show full command + output + prompt template',
        '--raw': 'Return full response body (no metadata suffix)',
      },
      probe_options: {
        '--target': 'Target URL (required)',
      },
      compress_options: {
        '--rounds': 'Repeatable: --rounds \'{"agent":"name","text":"..."}\'',
      },
      notes: 'Firefight debates are run by the opencode agent using @mentions to subagents in .opencode/agents/',
    }, null, 2));
    return;
  }

  if (mode === 'list') {
    const skills = fs.readdirSync(SKILL_DIR).filter(f => fs.statSync(path.join(SKILL_DIR, f)).isDirectory()).sort();
    const result = {};
    for (const s of skills) { const skill = loadSkill(s); if (skill) result[s] = { techniques: Object.keys(skill.techniques) }; }
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (mode === 'skill') {
    const vulnClass = args.class;
    if (!vulnClass) { console.log(JSON.stringify({ error: '--class is required' })); process.exit(1); }
    const skill = loadSkill(vulnClass);
    if (!skill) { console.log(JSON.stringify({ error: `Skill '${vulnClass}' not found` })); process.exit(1); }
    console.log(JSON.stringify({ class: vulnClass, router_summary: (skill.router || '').substring(0, 2000), techniques: Object.keys(skill.techniques), technique_details: skill.techniques }, null, 2));
    return;
  }

  if (mode === 'exec') {
    const target = args.target;
    if (!target) { console.log(JSON.stringify({ error: '--target is required' })); process.exit(1); }
    const result = execute(target, { payload: args.payload, method: args.method, param: args.param, headers: args.headers || [], body: args.body, contentType: args.type, cookie: args.cookie, agent: args.agent, playground: args.playground, raw: args.raw, protocol: args.protocol, dnsType: args.dnsType, dnsServer: args.dnsServer });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (mode === 'chain') {
    if (!args.finding) { console.log(JSON.stringify({ error: '--finding is required (JSON string)' })); process.exit(1); }
    console.log(JSON.stringify(chainProposal(args.finding), null, 2));
    return;
  }

  // ── probe ────────────────────────────────────────────────────
  if (mode === 'probe') {
    if (!args.target) { console.log(JSON.stringify({ error: '--target is required' })); process.exit(1); }
    console.log(JSON.stringify(probe(args.target), null, 2));
    return;
  }

  // ── compress ─────────────────────────────────────────────────
  if (mode === 'compress') {
    if (!args.rounds || args.rounds.length === 0) { console.log(JSON.stringify({ error: '--rounds is required (use multiple --rounds)' })); process.exit(1); }
    console.log(JSON.stringify(compressHistory(args.rounds), null, 2));
    return;
  }

  console.log(JSON.stringify({ error: `Unknown mode '${mode}'. Use --mode help` }));
}

main();
