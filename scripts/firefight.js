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

const target = args.target;
const finding = args.finding;

if (!target || !finding) {
  console.error(JSON.stringify({ error: 'Usage: node firefight.js --target <url> --finding <description>', status: 'error' }));
  process.exit(1);
}

console.error(`Firefight — target: ${target}`);
console.error(`Finding: ${finding}`);

// ─── Provider / Auth ─────────────────────────────────────────────

function detectProvider() {
  const configPaths = [
    '/content/opencode.json',
    path.join(process.env.HOME || '/root', '.config/opencode/opencode.json'),
    path.join(process.cwd(), 'opencode.json'),
  ];

  for (const p of configPaths) {
    try {
      const cfg = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (cfg.provider || cfg.model) return cfg;
    } catch {}
  }

  if (process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY) {
    return { provider: process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'openai' };
  }

  return { provider: 'anthropic' };
}

const config = detectProvider();

// ─── LLM Call ────────────────────────────────────────────────────

function buildSystemPrompt(agent, finding, transcript) {
  const personalities = {
    optimist:
      'You are an OPTIMISTIC pentester. You see gold in every finding. Your role is to enthusiastically argue that this vulnerability deserves full exploitation. Point out the worst-case scenario, maximum impact, and why ignoring this would be negligence. Be convincing and technical.',
    skeptic:
      'You are a SKEPTICAL pentester. You doubt everything until you see concrete proof. Your role is to question the finding: could this be noise? false positive? requires unlikely interaction? Demand robust confirmation before proceeding. Be rigorous and relentless.',
    engineer:
      'You are an EXPLOIT ENGINEER. Your role is to think about the concrete payload. What vector? What technique? What possible bypasses (WAF, filter, encoding)? Give specific commands and payloads that can be tested right now. Be practical and to the point.',
    strategist:
      'You are an OFFENSIVE SECURITY STRATEGIST. Your role is to think about chaining. If this finding is real, what other vulnerabilities could it unlock? What attack paths does it enable? Think 2-3 steps ahead. Be creative.',
    analyst:
      'You are a VULNERABILITY ANALYST. Your role is to technically classify the finding. What is the exact class (XSS, SQLi, SSTI, IDOR, SSRF, LFI, CMDi, XXE, CSRF, Auth)? Which specific skill technique applies? What is the related CWE/CVE? Be precise and reference established knowledge.'
  };

  const lines = [
    personalities[agent] || personalities.analyst,
    '',
    '## Finding Context',
    finding,
    '',
    '## Target',
    target,
    '',
  ];

  if (transcript.length > 0) {
    lines.push('## Debate History');
    lines.push('');
    for (const t of transcript) {
      lines.push(`### Round ${t.round} — ${t.agent.toUpperCase()}`);
      lines.push(t.response);
      lines.push('');
    }
    lines.push('## Your Turn');
    lines.push(`You are the "${agent.toUpperCase()}" agent. Respond according to your personality, considering what has been said.`);
  } else {
    lines.push(`You are the "${agent.toUpperCase()}" agent. This is the first round — no one has spoken yet.`);
  }

  return lines.join('\n');
}

function buildVotePrompt(finding, target, transcript) {
  const lines = [
    'You are the SECURITY COUNCIL. Below is the complete debate about a finding.',
    'Vote YES if the vulnerability deserves exploitation, NO if it is dismissable.',
    'Respond ONLY with "YES" or "NO" followed by a short justification sentence.',
    '',
    '## Finding',
    finding,
    '',
    '## Target',
    target,
    '',
    '## Debate History',
    '',
  ];
  for (const t of transcript) {
    lines.push(`--- ${t.agent.toUpperCase()} (Round ${t.round}) ---`);
    lines.push(t.response);
    lines.push('');
  }
  lines.push('## Your Vote');
  return lines.join('\n');
}

function buildSkillPrompt(vulnClass, finding, target, techniqueContent) {
  return [
    `You are a specialist in ${vulnClass.toUpperCase()}.`,
    'Use the techniques below to exploit the finding against the target.',
    'Suggest specific payloads and commands that can be EXECUTED NOW.',
    techniqueContent ? `\n## Skill Techniques (${vulnClass})\n${techniqueContent}` : '',
    '',
    '## Finding',
    finding,
    '',
    '## Target',
    target,
    '',
    'Respond in JSON format:',
    JSON.stringify({
      payload: 'payload string',
      method: 'GET/POST/etc',
      parameter: 'parameter name',
      expected_evidence: 'what to expect if it works'
    }, null, 2)
  ].join('\n');
}

function buildInterpretPrompt(payload, rawOutput) {
  return [
    'You executed a payload against a target. The raw output is below.',
    'Respond JSON: { "confirmed": true/false, "evidence": "relevant output excerpt", "confidence": "high/medium/low" }',
    '',
    'Payload: ' + payload,
    '',
    'Output:',
    rawOutput.substring(0, 4000)
  ].join('\n');
}

async function callLLM(messages, systemPrompt, maxTokens = 1024) {
  const prov = config.provider || 'anthropic';

  if (prov === 'anthropic') {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error('ANTHROPIC_API_KEY not set');
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model || 'claude-sonnet-4-20250514',
        system: systemPrompt,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      })
    });
    const data = await res.json();
    return data.content?.[0]?.text || JSON.stringify(data);

  } else if (prov === 'openai') {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY not set');
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4o',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: maxTokens,
        temperature: 0.7,
      })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || JSON.stringify(data);
  } else {
    throw new Error('Unsupported provider: ' + prov);
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
  let techniques = '';
  if (fs.existsSync(techDir)) {
    const files = fs.readdirSync(techDir).filter(f => f.endsWith('.md') && f !== 'index.md');
    for (const f of files) {
      techniques += `\n### ${f.replace('.md','')}\n`;
      techniques += fs.readFileSync(path.join(techDir, f), 'utf8').substring(0, 2000);
      techniques += '\n';
    }
  }

  return { router, techniques };
}

// ─── Execute Payload ──────────────────────────────────────────────

function executePayload(target, suggestion) {
  let payload, method, param;
  try {
    const parsed = JSON.parse(suggestion);
    payload = parsed.payload;
    method = (parsed.method || 'GET').toUpperCase();
    param = parsed.parameter;
  } catch {
    payload = suggestion.split('\n')[0].trim();
    method = 'GET';
  }

  const url = new URL(target);
  if (method === 'GET' && param) {
    url.searchParams.set(param, payload);
  }

  try {
    const curlCmd = method === 'POST'
      ? `curl -s -X POST '${target}' -d '${param}=${encodeURIComponent(payload)}' -m 10`
      : `curl -s '${url.toString()}' -m 10`;

    const output = execSync(curlCmd, { timeout: 12000, encoding: 'utf8', maxBuffer: 1024 * 100 });
    return output.substring(0, 4000);
  } catch (e) {
    return `[ERROR] ${e.message}`;
  }
}

// ─── Parse Vote ───────────────────────────────────────────────────

function parseVote(text) {
  const upper = text.toUpperCase();
  if (upper.includes('YES')) return 'yes';
  if (upper.includes('NO')) return 'no';
  return 'no';
}

// ─── Main Loop ────────────────────────────────────────────────────

async function main() {
  const agents = ['optimist', 'skeptic', 'engineer', 'strategist', 'analyst'];
  const transcript = [];
  let result = { status: 'running', class: null, technique: null, payload: null, evidence: null, chain: [] };

  // ── Phase 1: Debate ──────────────────────────────────────────

  for (let i = 0; i < 6; i++) {
    const agent = agents[i] || 'analyst';
    console.error(`\n=== Round ${i + 1}/6 — ${agent.toUpperCase()} ===`);

    try {
      const system = buildSystemPrompt(agent, finding, transcript);
      const response = await callLLM(
        [{ role: 'user', content: i === 0 ? `Finding: ${finding}\nTarget: ${target}` : 'Continue the debate.' }],
        system,
        512
      );
      transcript.push({ round: i + 1, agent, response });
      console.error(response);
    } catch (e) {
      console.error(`[ERROR] Round ${i+1}: ${e.message}`);
      transcript.push({ round: i + 1, agent, response: `[ERROR] ${e.message}` });
    }
  }

  // ── Voting ──────────────────────────────────────────────────

  console.error('\n=== VOTING ===');
  let votes = { yes: 0, no: 0 };
  try {
    const votePrompt = buildVotePrompt(finding, target, transcript);
    // Vote 4 times for robustness
    for (let v = 0; v < 4; v++) {
      const voteResp = await callLLM([{ role: 'user', content: 'Vote.' }], votePrompt, 128);
      console.error('Vote:', voteResp);
      const parsed = parseVote(voteResp);
      votes[parsed]++;
    }
  } catch (e) {
    console.error(`[ERROR] Voting: ${e.message}`);
    votes = { yes: 2, no: 2 };
  }

  const approved = votes.yes >= 3;
  console.error(`\nVotes: YES=${votes.yes} NO=${votes.no} => ${approved ? 'APPROVED' : 'REJECTED'}`);

  if (!approved) {
    result.status = 'rejected';
    console.log(JSON.stringify(result));
    return;
  }

  // ── Phase 2: Identify class ─────────────────────────────────

  console.error('\n=== IDENTIFYING CLASS ===');
  const analystResponse = transcript.find(t => t.agent === 'analyst')?.response || '';
  const classPrompt = [
    'Extract ONLY the vulnerability class from the text below.',
    'Respond with ONE word: xss, sqli, ssti, idor, ssrf, lfi, cmdi, xxe, csrf, auth, api, or other.',
    '',
    analystResponse
  ].join('\n');

  let vulnClass = 'other';
  try {
    const classResp = await callLLM([{ role: 'user', content: 'What is the class?' }], classPrompt, 64);
    const match = classResp.toLowerCase().match(/\b(xss|sqli|ssti|idor|ssrf|lfi|cmdi|xxe|csrf|auth|api)\b/);
    if (match) vulnClass = match[1];
  } catch {}

  result.class = vulnClass;
  console.error('Class:', vulnClass);

  // ── Phase 3: Load skill + exploitation ──────────────────────

  console.error(`\n=== EXPLOITATION (${vulnClass}) ===`);
  const skill = loadSkill(vulnClass);
  const techniqueContent = skill ? skill.techniques : 'No specific techniques found. Use generic payload.';

  let confirmed = false;
  let attempts = 0;
  const MAX_ATTEMPTS = 3;

  while (!confirmed && attempts < MAX_ATTEMPTS) {
    attempts++;

    try {
      const eSys = buildSkillPrompt(vulnClass, finding, target, techniqueContent);
      const eRes = await callLLM([
        { role: 'user', content: `Attempt ${attempts}/${MAX_ATTEMPTS}. Suggest specific payload to exploit ${vulnClass} on ${target}.` }
      ], eSys, 512);
      console.error(`Suggested payload:\n${eRes}`);

      const rawOutput = executePayload(target, eRes);
      console.error(`Output (${rawOutput.length} bytes):\n${rawOutput.substring(0, 500)}`);

      const iPrompt = buildInterpretPrompt(eRes, rawOutput);
      const iRes = await callLLM([{ role: 'user', content: 'Confirm or reject?' }], iPrompt, 256);
      console.error('Interpretation:', iRes);

      try {
        const parsed = JSON.parse(iRes);
        confirmed = parsed.confirmed === true;
        if (confirmed) {
          result.payload = parsed.payload || eRes;
          result.evidence = parsed.evidence || rawOutput.substring(0, 500);
        }
      } catch {
        confirmed = iRes.toLowerCase().includes('confirm') && !iRes.toLowerCase().includes('not');
      }

      if (confirmed) {
        result.status = 'confirmed';
        console.error('\nVULNERABILITY CONFIRMED');
      }

    } catch (e) {
      console.error(`[ERROR] Attempt ${attempts}: ${e.message}`);
    }
  }

  // ── Phase 4: Chains (if confirmed) ───────────────────────────

  if (confirmed) {
    console.error('\n=== ATTACK CHAIN ===');

    for (let c = 0; c < 3; c++) {
      const chainPrompt = [
        'The vulnerability has been CONFIRMED. Now think about ATTACK CHAINING.',
        c === 0
          ? 'What other vulnerabilities could be present on this same target to compose a chain attack?'
          : c === 1
            ? 'Given what was confirmed and the Optimist ideas, what is the MOST LIKELY attack route?'
            : 'Is this chain worth exploring? Answer YES or NO.',
        '',
        `Confirmed finding: ${JSON.stringify(result)}`,
        '',
        'Target: ' + target
      ].join('\n');

      try {
        const chainRes = await callLLM([{ role: 'user', content: 'Chain?' }], chainPrompt, 384);
        console.error(`Chain round ${c+1}: ${chainRes}`);

        if (c === 2) {
          if (chainRes.toUpperCase().includes('YES')) {
            result.status = 'chains_found';
            result.chain.push({ suggestion: chainRes });
          }
        } else {
          result.chain.push({ round: c+1, thought: chainRes });
        }
      } catch (e) {
        console.error(`[ERROR] Chain ${c+1}: ${e.message}`);
      }
    }
  } else {
    result.status = 'exploitation_failed';
    console.error('\nEXPLOITATION FAILED after 3 attempts');
  }

  // ── Output ──────────────────────────────────────────────────

  console.log(JSON.stringify(result, null, 2));
}

main().catch(e => {
  console.error(e);
  console.log(JSON.stringify({ status: 'error', error: e.message }));
});
