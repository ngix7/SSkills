# SSkills

Security Skills — structured specialist knowledge for web application security testing. Every skill contains battle-tested technique cards with real payloads, identification logic, and exploitation flows.

## Installation

```bash
git clone https://github.com/ngix7/SSkills.git
cd SSkills
npm install
```

## Quick Start

```bash
# Validate every skill's structure
npm run validate

# Validate a single skill
npm run validate:xss
npm run validate:ssti
```

## Firefight Tool

Debate + exploitation engine. 5 AI agents debate a finding across 6 rounds, then load the matching skill from disk and attempt exploitation.

```bash
node scripts/firefight.js \
  --target "http://target.com/page?param=value" \
  --finding "parameter reflects user input without sanitization"
```

Requires `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` in environment. Uses model and provider from opencode.json config.

## Skills

| # | Skill | Focus |
|---|-------|-------|
| 1 | [Race Condition](skills/race-condition/README.md) | Concurrent request exploitation, TOCTOU, limit overrun |
| 2 | [Request Smuggling](skills/smuggling/README.md) | CL.TE, TE.CL, TE.TE smuggling |
| 3 | [Cache Poisoning](skills/cache-poisoning/README.md) | Unkeyed input poisoning, cache deception |
| 4 | [Deserialization](skills/deserialization/README.md) | PHP, Java, Python, Ruby deserialization RCE |
| 5 | [NoSQL Injection](skills/nosql-injection/README.md) | MongoDB $ne/$regex, blind NoSQL, JSON body |
| 6 | [Prototype Pollution](skills/prototype-pollution/README.md) | Client/server-side PP, gadget chains, RCE |
| 7 | [Open Redirect](skills/open-redirect/README.md) | URL bypass, parameter injection, chaining |
| 8 | [CORS Misconfig](skills/cors/README.md) | Origin reflection, wildcard+credentials, preflight |
| 9 | [Business Logic](skills/business-logic/README.md) | Workflow bypass, price manipulation, 2FA skip |
| 10 | [XSS](skills/xss/README.md) | Cross-Site Scripting (reflected, stored, DOM) |
| 11 | [SQL Injection](skills/sql-injection/README.md) | SQLi (error, blind, time, OOB) |
| 12 | [CSRF](skills/csrf/README.md) | Cross-Site Request Forgery |
| 13 | [SSRF](skills/ssrf/README.md) | Server-Side Request Forgery |
| 14 | [Auth Bypass](skills/authentication-bypass/README.md) | JWT, OAuth, session, 2FA |
| 15 | [IDOR](skills/idor/README.md) | Insecure Direct Object References |
| 16 | [XXE](skills/xxe/README.md) | XML External Entity Injection |
| 17 | [CMD Injection](skills/command-injection/README.md) | OS Command Injection |
| 18 | [LFI/RFI](skills/lfi-rfi/README.md) | File Inclusion & Path Traversal |
| 19 | [API Security](skills/api-security/README.md) | REST, GraphQL, tRPC |
| 20 | [Wayback Recon](skills/wayback-recon/README.md) | Historical URL recon & passive discovery |
| 21 | [SSTI](skills/ssti/README.md) | Server-Side Template Injection (Jinja2, Twig, Freemarker, ERB) |
| 22 | [Subdomain Enum](skills/subdomain-enum/README.md) | DNS brute-force, CT logs, passive DNS, zone transfer |
| 23 | [FP Validation](skills/false-positive-validation/README.md) | False positive detection & triage |

## Structure

Each skill lives under `skills/<slug>/` and contains:

| File | Purpose |
|------|---------|
| `skill.json` | Machine metadata (slug, name, technique map) |
| `README.md` | Human entrypoint with technique index |
| `router.md` | Triage rules: detection -> identification -> rejection -> technique selection |
| `output-schema.json` | JSON Schema for structured findings |
| `sources.json` | References (OWASP, PortSwigger, CWE) |
| `techniques/*.md` | Technique cards — one per attack vector or engine |
| `scripts/validate.js` | Validates structure, required files, and schema |

## AGENTS.md

This repo includes an `AGENTS.md` that AI coding agents (opencode, Claude Code, Cursor, etc.) read automatically. It describes the project structure, naming conventions, validation commands, and how to create new skills. Open opencode in this directory to use it.

## Creating a New Skill

1. Create `skills/<slug>/` with all required files
2. Write technique cards under `techniques/`
3. Register in `scripts/validate-all.js`
4. Register in root `skills.json`
5. Add validate script in `package.json`
6. Update this README table
7. Run `npm run validate`

## Configuration

opencode.json at the repo root registers `firefight` as a custom tool. The global opencode config at `~/.config/opencode/opencode.json` or `/content/opencode.json` provides provider and model settings.

---

legends never die
