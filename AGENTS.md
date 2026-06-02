# SSkills

Private repository of structured web security testing skills.

## Structure

Each skill lives under `skills/<slug>/` and contains:

| File | Purpose |
|------|---------|
| `skill.json` | Machine metadata (slug, name, description, version, technique_map) |
| `README.md` | Human entrypoint: links to every technique card |
| `router.md` | Triage rules: detection -> engine identification -> rejection rules -> technique selection |
| `output-schema.json` | JSON Schema for structured findings |
| `sources.json` | References (OWASP, PortSwigger, CWE) |
| `techniques/*.md` | Technique cards -- one per engine/vector |
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

## Firefight

Orchestrated vulnerability debate + exploitation using opencode subagents.

### Agents

6 subagents are registered in `.opencode/agents/` and `opencode.json`:

| @mention | Role | Stance |
|----------|------|--------|
| `@firefight-optimist` | Optimistic debater | Sees gold in everything, argues for exploitation |
| `@firefight-skeptic` | Skeptical debater | Doubts everything, demands concrete proof |
| `@firefight-engineer` | Exploit engineer | Thinks about practical payload, bypasses, encoding |
| `@firefight-strategist` | Security strategist | Thinks about attack chaining, 2-3 steps ahead |
| `@firefight-analyst` | Vulnerability analyst | Classifies the vuln, references skills and CWEs |
| `@firefight-judge` | **Judge** | Votes, sets severity, classifies, recommends technique |

### Workflow

The debate is run by the opencode agent (me). Each turn I @mention the next subagent with the finding, target, and full debate history.

```
Round 1: @firefight-optimist "Finding: param X reflects user input. Target: example.com"
Round 2: @firefight-skeptic   "History: [optimist's response]. Your turn."
Round 3: @firefight-engineer  "History: [previous responses]. Your turn."
Round 4: @firefight-strategist "History: [previous responses]. Your turn."
Round 5: @firefight-analyst   "History: [previous responses]. Your turn."
Round 6: @firefight-judge    "All 5 responses above. Your verdict."
```

Round 6 (judge) returns JSON: `{"vote":"YES/NO","severity":"low/med/high/crit","class":"xss","technique":"reflected","confidence":"high","reasoning":"..."}`

If approved (>=3 YES), I load the matching skill and use `firefight.js` for execution.

### firefight.js — Execution Engine

`scripts/firefight.js` handles the non-LLM parts: skill loading, payload execution, CORS probing, history compression, chain proposals, and output.

```bash
# List all skills
node scripts/firefight.js --mode list

# Load skill techniques
node scripts/firefight.js --mode skill --class xss

# Execute payload with playground (shows curl + full output + prompt)
node scripts/firefight.js --mode exec --target "https://target.com/page?param=1" --payload "<script>alert(1)</script>" --method GET --param q --playground

# POST with JSON body and custom headers
node scripts/firefight.js --mode exec --target "https://target.com/api/Users" --method POST --body '{"email":"x","password":"x","role":"admin"}' --type application/json --headers "Authorization: Bearer xxx" --headers "Origin: https://evil.com" --playground

# Chain proposal from confirmed finding
node scripts/firefight.js --mode chain --finding '{"class":"cors","technique":"wildcard-credentials","severity":"high"}'

# DNS lookup (OOB detection)
node scripts/firefight.js --mode exec --target attacker.com --dns-type TXT --playground

# WebSocket test (OOB detection)
node scripts/firefight.js --mode exec --target 'wss://target.com/ws' --payload '{"message":"test"}' --playground

# Probe target for CORS + public endpoints
node scripts/firefight.js --mode probe --target https://juice-shop-staging.herokuapp.com

# Compress debate history for compact prompts
node scripts/firefight.js --mode compress \
  --rounds '{"agent":"optimist","text":"arg..."}' \
  --rounds '{"agent":"skeptic","text":"counter..."}' \
  --rounds '{"agent":"engineer","text":"exploit..."}'
```

### Config

Agents are defined in `opencode.json` at repo root. No API keys needed -- opencode handles authentication for subagents.
