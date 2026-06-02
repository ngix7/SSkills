# SSkills

Private repository of structured web security testing skills.

## Structure

Each skill lives under `skills/<slug>/` and contains:

| File | Purpose |
|------|---------|
| `skill.json` | Machine metadata (slug, name, description, version, technique_map) |
| `README.md` | Human entrypoint: links to every technique card |
| `router.md` | Triage rules: detection → engine identification → rejection rules → technique selection |
| `output-schema.json` | JSON Schema for structured findings |
| `sources.json` | References (OWASP, PortSwigger, CWE) |
| `techniques/*.md` | Technique cards — one per engine/vector |
| `scripts/validate.js` | Validates structure + required fields |

## Conventions

- Technique cards start with `# Engine Name` then sections: Summary, Identification, Basic Confirmation, Read Files, RCE, Remediation.
- `router.md` must have: Signal Classes, Triage Rules, Rejection Rules, Technique Selection table.
- `output-schema.json` must have `required` array and `properties` with at least: the main finding field, severity/confirmation level, technique, evidence.
- `skill.json` `technique_map` keys match technique file names (no `.md`).
- Rejection rules in router.md define false positive criteria (required for every skill).
- No safety.md files, no safety_posture in skill.json, no moralizing.

## Commands

```bash
npm run validate              # Validate ALL skills
npm run validate:ssti         # Validate single skill
```

## Creating a New Skill

1. Create `skills/<slug>/` with all required files
2. Write technique cards under `techniques/`
3. Add to `scripts/validate-all.js` array
4. Add to `skills.json` at root
5. Add validate script to `package.json`
6. Update README.md table
7. Run `npm run validate`

## Target Validation

Skills are validated against real vulnerable targets (e.g., Juice Shop) before being saved. Commands in technique cards should be tested and work. Technique cards are executable pipelines (curl, dig, subfinder, httpx), not theory.

## Firefight Tool

Registrado em `opencode.json` como custom tool. Orquestra debate + exploração.

### Fluxo

1. **Fase 1 — Debate (6 turnos):** Otimista → Cética → Engenheiro → Estrategista → Analista → Votação. Cada turno chama o LLM com a personalidade do agente + transcript completo do debate.
2. **Votação:** LLM vota 4x. ≥3 SIM → aprovado.
3. **Fase 2 — Especialização:** Script identifica a classe (XSS, SQLi, SSTI...) e carrega a skill correspondente do disco.
4. **Fase 3 — Exploração:** Especialista sugere payloads → script executa via curl → LLM interpreta resultado. Até 3 tentativas.
5. **Fase 4 — Chains (se confirmou):** Otimista → Estrategista → Votação sobre chain de ataque.

### Personalidades dos debatedores

| Agente | Postura |
|--------|---------|
| **Otimista** | Enxerga gold em tudo, argumenta pela exploração |
| **Cética** | Duvida de tudo, pede prova concreta |
| **Engenheiro** | Pensa no payload prático, bypasses, encoding |
| **Estrategista** | Pensa em chains e rotas de ataque |
| **Analista** | Classifica a vuln, referencia skills e CWEs |

### Uso

```bash
# Direto
node scripts/firefight.js --target "http://testphp.vulnweb.com/search.php?test=query" --finding "parametro test reflete input sem sanitizacao"

# Via opencode tool (precisa do opencode.json na raiz)
# Abre o opencode no repo e usa a tool registrada
```

### Output

```json
{
  "status": "confirmed",
  "class": "xss",
  "technique": "reflected",
  "payload": "<img src=x onerror=alert(1)>",
  "evidence": "alert(1) executou",
  "chain": []
}
```

### Config

- Lê provider/model do `opencode.json` global ou deste repo
- Usa `ANTHROPIC_API_KEY` ou `OPENAI_API_KEY` do ambiente
