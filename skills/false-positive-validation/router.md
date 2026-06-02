# False Positive Validation Router

## Signal Classes
- `confirmed` — Exploitable, validated
- `false-positive` — Expected behavior, encoding, WAF, or error noise
- `inconclusive` — Needs more investigation
- `informational` — Real but low/no impact

## Triage Rules

### Before marking any finding as "confirmed":
1. Run general-triage checks first
2. Load the vulnerability-specific technique card
3. Apply all validation criteria
4. If ANY rejection criterion matches → mark as false positive

## Technique Selection

| Vulnerability Class | Validation Technique |
|--------------------|---------------------|
| Any finding | general-triage (always first) |
| XSS | xss-validation |
| SQL injection | sqli-validation |
| JWT bypass | jwt-validation |
| IDOR / ACL | idor-validation |
| XXE | xxe-validation |
| SSRF | ssrf-validation |
| CSRF | csrf-validation |
| Command injection | cmdi-validation |
| LFI/RFI | lfi-validation |
| API issues | api-validation |

## Confidence Assessment

For each finding, assign:
1. **Reproducibility** (1-5): How consistently can you trigger it?
2. **Control** (1-5): Can you control the output/content?
3. **Impact** (1-5): What can an attacker actually do?
4. **Complexity** (1-5): How many steps/preconditions needed?

Score > 12/20 → Report | Score 8-12 → Investigate more | Score < 8 → Discard
