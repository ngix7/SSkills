# False Positive Validation & Triage

Methodology to distinguish real vulnerabilities from false positives across all web security classes.

An LLM running pentests must not report findings without proper confirmation. This skill defines the validation gates for every vulnerability class.

## Techniques

| Technique | Description |
|-----------|-------------|
| [General Triage](techniques/general-triage.md) | Universal methodology for any finding |
| [XSS Validation](techniques/xss-validation.md) | Confirm XSS: execution vs. reflection |
| [SQLi Validation](techniques/sqli-validation.md) | Confirm SQLi: data extraction vs. error noise |
| [JWT Validation](techniques/jwt-validation.md) | Confirm JWT attacks: acceptance vs. silent discard |
| [IDOR Validation](techniques/idor-validation.md) | Confirm IDOR: actual access vs. benign response |
| [XXE Validation](techniques/xxe-validation.md) | Confirm XXE: file read vs. parsing error |
| [SSRF Validation](techniques/ssrf-validation.md) | Confirm SSRF: server-side request vs. DNS-only |
| [CSRF Validation](techniques/csrf-validation.md) | Confirm CSRF: state change vs. idempotent action |
| [CMDi Validation](techniques/cmdi-validation.md) | Confirm CMDi: execution vs. echo/mirror |
| [LFI Validation](techniques/lfi-validation.md) | Confirm LFI: file inclusion vs. error message |
| [API Security Validation](techniques/api-validation.md) | Confirm API issues: exploitation vs. spec compliance |

## Core Principle

**A finding is only valid if you can explain exactly WHY it's a vulnerability and HOW it can be exploited. "It returned something different" is not enough.**

## Confidence Levels

| Level | Meaning | Action |
|-------|---------|--------|
| Confirmed | Exploitable, demonstrated impact | Report |
| Likely | Strong indicators, cannot fully exploit | Report as low/info |
| Inconclusive | Weird behavior, unclear if exploitable | Investigate more or discard |
| False Positive | Explained by normal behavior | Discard |
