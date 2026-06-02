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

Registered in `opencode.json` as a custom tool. Orchestrates debate + exploitation.

### Flow

1. **Phase 1 — Debate (6 rounds):** Optimist -> Skeptic -> Engineer -> Strategist -> Analyst -> Voting. Each round calls LLM with the agent's personality + full debate transcript.
2. **Voting:** LLM votes 4 times. >=3 YES -> approved.
3. **Phase 2 — Specialization:** Script identifies the class (XSS, SQLi, SSTI...) and loads the corresponding skill from disk.
4. **Phase 3 — Exploitation:** Specialist suggests payloads -> script executes via curl -> LLM interprets result. Up to 3 attempts.
5. **Phase 4 — Chains (if confirmed):** Optimist -> Strategist -> Voting on attack chain.

### Debater Personalities

| Agent | Stance |
|-------|--------|
| **Optimist** | Sees gold in everything, argues for exploitation |
| **Skeptic** | Doubts everything, demands concrete proof |
| **Engineer** | Thinks about practical payload, bypasses, encoding |
| **Strategist** | Thinks about chains and attack routes |
| **Analyst** | Classifies the vuln, references skills and CWEs |

### Usage

```bash
# Direct
node scripts/firefight.js --target "http://testphp.vulnweb.com/search.php?test=query" --finding "parameter test reflects user input without sanitization"

# Via opencode tool (requires opencode.json at root)
# Open opencode in the repo and use the registered tool
```

### Output

```json
{
  "status": "confirmed",
  "class": "xss",
  "technique": "reflected",
  "payload": "<img src=x onerror=alert(1)>",
  "evidence": "alert(1) executed",
  "chain": []
}
```

### Config

- Reads provider/model from global or repo `opencode.json`
- Uses `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` from environment
