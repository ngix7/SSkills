# HTTP Request Smuggling Techniques

- [Detection](detection.md) — CL.TE and TE.CL detection with differential response analysis
- [CL.TE](cl-te.md) — Content-Length vs Transfer-Encoding: front-end uses CL, back-end uses TE
- [TE.CL](te-cl.md) — Transfer-Encoding vs Content-Length: front-end uses TE, back-end uses CL
- [TE.TE](te-te.md) — Obfuscated Transfer-Encoding headers for parser differential
- [Impact](impact.md) — Web cache poisoning, request hijacking, and WAF bypass
