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

console.error(`🔫 Firefight — target: ${target}`);
console.error(`🔍 Finding: ${finding}`);

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

  // Try env vars
  if (process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY) {
    return { provider: process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'openai' };
  }

  return { provider: 'anthropic' };
}

const config = detectProvider();
const apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || 'NO_KEY';

// ─── LLM Call ────────────────────────────────────────────────────

function buildSystemPrompt(agent, finding, transcript) {
  const personalities = {
    otimista:
      'Você é um pentester OTIMISTA. Você enxerga gold em todo finding. Seu papel é defender com entusiasmo que essa vulnerabilidade merece exploração total. Aponte o pior caso possível, o impacto máximo, e porque ignorar isso seria negligência. Seja convincente e técnico.',
    cetica:
      'Você é um pentester CÉTICO. Você duvida de tudo até ver prova concreta. Seu papel é questionar o finding: isso pode ser ruído? falso positivo? requer interação improvável? Peça confirmação robusta antes de prosseguir. Seja criterioso e implacável.',
    engenheiro:
      'Você é ENGENHEIRO DE EXPLOITS. Seu papel é pensar no payload concreto. Que vetor? Que técnica? Quais possíveis bypasses (WAF, filter, encoding)? Dê comandos e payloads específicos que podem ser testados agora. Seja prático e direto ao ponto.',
    estrategista:
      'Você é um ESTRATEGISTA de segurança ofensiva. Seu papel é pensar em cadeia (chaining). Se este finding for real, que outras vulnerabilidades ele pode abrir? Que rotas de ataque isso desbloqueia? Pense em 2-3 passos à frente. Seja criativo.',
    analista:
      'Você é um ANALISTA de vulnerabilidades. Seu papel é classificar o finding tecnicamente. Qual a classe exata (XSS, SQLi, SSTI, IDOR, SSRF, LFI, CMDi, XXE, CSRF, Auth)? Qual técnica específica da skill se aplica? Qual é o CWE/CVE relacionado? Seja preciso e referencie conhecimento estabelecido.'
  };

  const lines = [
    personalities[agent] || personalities.analista,
    '',
    '## Contexto do Finding',
    finding,
    '',
    '## Target',
    target,
    '',
  ];

  if (transcript.length > 0) {
    lines.push('## Histórico do Debate');
    lines.push('');
    for (const t of transcript) {
      lines.push(`### Turno ${t.turno} — ${t.agente.toUpperCase()}`);
      lines.push(t.resposta);
      lines.push('');
    }
    lines.push('## Sua Vez');
    lines.push(`Você é o agente "${agent.toUpperCase()}". Responda de acordo com sua personalidade, considerando o que já foi dito.`);
  } else {
    lines.push(`Você é o agente "${agent.toUpperCase()}". É o primeiro turno — ninguém falou ainda.`);
  }

  return lines.join('\n');
}

function buildVotePrompt(finding, target, transcript) {
  const lines = [
    'Você é o CONSELHO DE SEGURANÇA. Abaixo está o debate completo sobre um finding.',
    'Vote SIM se a vulnerabilidade merece exploração, NÃO se é descartável.',
    'Responda APENAS com "SIM" ou "NÃO" seguido de uma frase curta de justificativa.',
    '',
    '## Finding',
    finding,
    '',
    '## Target',
    target,
    '',
    '## Histórico do Debate',
    '',
  ];
  for (const t of transcript) {
    lines.push(`--- ${t.agente.toUpperCase()} (Turno ${t.turno}) ---`);
    lines.push(t.resposta);
    lines.push('');
  }
  lines.push('## Seu Voto');
  return lines.join('\n');
}

function buildSkillPrompt(classe, finding, target, techniqueContent) {
  return [
    `Você é um especialista em ${classe.toUpperCase()}.`,
    'Use as técnicas abaixo para explorar o finding contra o target.',
    'Sugira payloads específicos e comandos que possam ser executados AGORA.',
    techniqueContent ? `\n## Técnicas da Skill ${classe}\n${techniqueContent}` : '',
    '',
    '## Finding',
    finding,
    '',
    '## Target',
    target,
    '',
    'Responda em formato JSON:',
    JSON.stringify({
      payload: 'payload string',
      method: 'GET/POST/etc',
      parameter: 'nome do parametro',
      expected_evidence: 'o que esperar ver se funcionar'
    }, null, 2)
  ].join('\n');
}

function buildInterpretPrompt(payload, rawOutput) {
  return [
    'Você executou um payload contra um alvo. O output bruto está abaixo.',
    'Responda JSON: { "confirmed": true/false, "evidence": "trecho relevante do output", "confidence": "high/medium/low" }',
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

function carregarSkill(classe) {
  const base = path.join(SKILL_DIR, classe);
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

function executarPayload(target, suggestion) {
  let payload, method, param;
  try {
    const parsed = JSON.parse(suggestion);
    payload = parsed.payload;
    method = (parsed.method || 'GET').toUpperCase();
    param = parsed.parameter;
  } catch {
    // plain text payload, guess
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

function parseVoto(texto) {
  const upper = texto.toUpperCase();
  if (upper.includes('SIM')) return 'sim';
  if (upper.includes('NÃO') || upper.includes('NAO')) return 'nao';
  return upper.includes('YES') ? 'sim' : 'nao';
}

// ─── Main Loop ────────────────────────────────────────────────────

async function main() {
  const agents = ['otimista', 'cetica', 'engenheiro', 'estrategista', 'analista'];
  const transcript = [];
  let resultado = { status: 'running', class: null, technique: null, payload: null, evidence: null, chain: [] };

  // ── Fase 1: Debate ──────────────────────────────────────────

  for (let i = 0; i < 6; i++) {
    const agente = agents[i] || 'analista';
    console.error(`\n=== Turno ${i + 1}/6 — ${agente.toUpperCase()} ===`);

    try {
      const system = buildSystemPrompt(agente, finding, transcript);
      const resposta = await callLLM(
        [{ role: 'user', content: i === 0 ? `Finding: ${finding}\nTarget: ${target}` : 'Continue o debate.' }],
        system,
        512
      );
      transcript.push({ turno: i + 1, agente, resposta });
      console.error(resposta);
    } catch (e) {
      console.error(`[ERRO] Turno ${i+1}: ${e.message}`);
      transcript.push({ turno: i + 1, agente, resposta: `[ERRO] ${e.message}` });
    }
  }

  // ── Votação ────────────────────────────────────────────────

  console.error('\n=== VOTAÇÃO ===');
  let votos = { sim: 0, nao: 0 };
  try {
    const votePrompt = buildVotePrompt(finding, target, transcript);
    const voto = await callLLM([{ role: 'user', content: 'Vote.' }], votePrompt, 128);
    console.error('Voto:', voto);
    const parsed = parseVoto(voto);
    // Vote 3x for robustness
    for (let v = 0; v < 3; v++) {
      const v2 = await callLLM([{ role: 'user', content: 'Vote novamente.' }], votePrompt, 128);
      const p2 = parseVoto(v2);
      votos[p2]++;
    }
    votos[parsed]++;
  } catch (e) {
    console.error(`[ERRO] Votação: ${e.message}`);
    votos = { sim: 2, nao: 2 }; // tie -> reject
  }

  const aprovado = votos.sim >= 3;
  console.error(`\nVotos: SIM=${votos.sim} NÃO=${votos.nao} → ${aprovado ? 'APROVADO' : 'REJEITADO'}`);

  if (!aprovado) {
    resultado.status = 'rejected';
    console.log(JSON.stringify(resultado));
    return;
  }

  // ── Fase 2: Identificar classe ──────────────────────────────

  console.error('\n=== IDENTIFICANDO CLASSE ===');
  const analistaResp = transcript.find(t => t.agente === 'analista')?.resposta || '';
  const classPrompt = [
    'Extraia APENAS a classe de vulnerabilidade do texto abaixo.',
    'Responda com UMA palavra: xss, sqli, ssti, idor, ssrf, lfi, cmdi, xxe, csrf, auth, api, ou other.',
    '',
    analistaResp
  ].join('\n');

  let classe = 'other';
  try {
    const classResp = await callLLM([{ role: 'user', content: 'Qual a classe?' }], classPrompt, 64);
    const match = classResp.toLowerCase().match(/\b(xss|sqli|ssti|idor|ssrf|lfi|cmdi|xxe|csrf|auth|api)\b/);
    if (match) classe = match[1];
  } catch {}

  resultado.class = classe;
  console.error('Classe:', classe);

  // ── Fase 3: Carregar skill + exploração ─────────────────────

  console.error(`\n=== EXPLORAÇÃO (${classe}) ===`);
  const skill = carregarSkill(classe);
  const techniqueContent = skill ? skill.techniques : 'Nenhuma técnica específica encontrada. Use payload genérico.';

  let confirmado = false;
  let tentativas = 0;
  const MAX_TENTATIVAS = 3;

  while (!confirmado && tentativas < MAX_TENTATIVAS) {
    tentativas++;

    try {
      const esys = buildSkillPrompt(classe, finding, target, techniqueContent);
      const eRes = await callLLM([
        { role: 'user', content: `Tentativa ${tentativas}/${MAX_TENTATIVAS}. Sugira payload específico para explorar ${classe} em ${target}.` }
      ], esys, 512);
      console.error(`Payload sugerido:\n${eRes}`);

      const rawOutput = executarPayload(target, eRes);
      console.error(`Output (${rawOutput.length} bytes):\n${rawOutput.substring(0, 500)}`);

      const iPrompt = buildInterpretPrompt(eRes, rawOutput);
      const iRes = await callLLM([{ role: 'user', content: 'Confirma ou não?' }], iPrompt, 256);
      console.error('Interpretação:', iRes);

      try {
        const parsed = JSON.parse(iRes);
        confirmado = parsed.confirmed === true;
        if (confirmado) {
          resultado.payload = parsed.payload || eRes;
          resultado.evidence = parsed.evidence || rawOutput.substring(0, 500);
        }
      } catch {
        confirmado = iRes.toLowerCase().includes('confirm') || iRes.toLowerCase().includes('funcionou');
      }

      if (confirmado) {
        resultado.status = 'confirmed';
        console.error('\n✅ VULNERABILIDADE CONFIRMADA');
      }

    } catch (e) {
      console.error(`[ERRO] Tentativa ${tentativas}: ${e.message}`);
    }
  }

  // ── Fase 4: Chains (se confirmou) ────────────────────────────

  if (confirmado) {
    console.error('\n=== CHAIN DE ATTACK ===');

    for (let c = 0; c < 3; c++) {
      const chainAgents = c === 0 ? 'otimista' : (c === 1 ? 'estrategista' : 'votacao');
      const chainPrompt = [
        'A vulnerabilidade foi CONFIRMADA. Agora pense em CHAIN de ataque.',
        c === 0
          ? 'Que outras vulnerabilidades poderiam estar presentes neste mesmo alvo para compor um ataque em cadeia?'
          : c === 1
            ? 'Dado o que foi confirmado e as ideias do Otimista, qual a rota de ataque MAIS PROVÁVEL?'
            : 'Esta chain vale a pena ser explorada? Responda SIM ou NÃO.',
        '',
        `Finding confirmado: ${JSON.stringify(resultado)}`,
        '',
        'Target: ' + target
      ].join('\n');

      try {
        const chainRes = await callLLM([{ role: 'user', content: 'Chain?' }], chainPrompt, 384);
        console.error(`Chain turno ${c+1}: ${chainRes}`);

        if (c === 2) { // votação
          if (chainRes.toUpperCase().includes('SIM')) {
            resultado.status = 'chains_found';
            resultado.chain.push({ suggestion: chainRes });
          }
        } else {
          resultado.chain.push({ turno: c+1, thought: chainRes });
        }
      } catch (e) {
        console.error(`[ERRO] Chain ${c+1}: ${e.message}`);
      }
    }
  } else {
    resultado.status = 'exploitation_failed';
    console.error('\n❌ EXPLORAÇÃO FALHOU após 3 tentativas');
  }

  // ── Output ──────────────────────────────────────────────────

  console.log(JSON.stringify(resultado, null, 2));
}

main().catch(e => {
  console.error(e);
  console.log(JSON.stringify({ status: 'error', error: e.message }));
});
