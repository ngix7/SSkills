# SSkills

Security Skills — structured specialist knowledge for web application security testing.

## Skills

| # | Skill | Focus |
|---|-------|-------|
| 1 | [XSS](skills/xss/README.md) | Cross-Site Scripting (reflected, stored, DOM) |
| 2 | [SQL Injection](skills/sql-injection/README.md) | SQLi (error, blind, time, OOB) |
| 3 | [CSRF](skills/csrf/README.md) | Cross-Site Request Forgery |
| 4 | [SSRF](skills/ssrf/README.md) | Server-Side Request Forgery |
| 5 | [Auth Bypass](skills/authentication-bypass/README.md) | JWT, OAuth, session, 2FA |
| 6 | [IDOR](skills/idor/README.md) | Insecure Direct Object References |
| 7 | [XXE](skills/xxe/README.md) | XML External Entity Injection |
| 8 | [CMD Injection](skills/command-injection/README.md) | OS Command Injection |
| 9 | [LFI/RFI](skills/lfi-rfi/README.md) | File Inclusion & Path Traversal |
| 10 | [API Security](skills/api-security/README.md) | REST, GraphQL, tRPC |

## Structure

Each skill contains:
- `skill.json` — machine metadata
- `README.md` — human entrypoint
- `router.md` — triage rules
- `safety.md` — hard gates
- `output-schema.json` — structured output
- `sources.json` — references
- `techniques/` — technique cards
- `scripts/validate.js` — validation

## Usage

Run all validators: `npm run validate`
