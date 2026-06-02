# Prototype Pollution Router

## Signal Classes
- `pp-detected` — Recursive merge/assign pattern detected in source or runtime
- `pp-confirmed` — `__proto__` or `constructor.prototype` pollution confirmed
- `pp-exploitable` — Polluted property reaches sink (XSS, RCE)

## Triage Rules

1. Identify recursive merge, clone, or assign operations in client JS or server endpoints
2. Check for user-controlled keys in JSON body, query string, or path segments
3. Probe with `{"__proto__": {"polluted": "true"}}`
4. Check if `Object.prototype.polluted` is observable globally
5. Follow property flow from source to sink (innerHTML, eval, exec)

## Technique Selection

| Signal | Technique |
|--------|-----------|
| Unknown PP context | detection |
| Browser environment, DOM sink | client-side |
| Node.js server, child_process exec | server-side |
| Object.freeze / Object.seal in use | mitigation-bypass |

## Rejection Rules

- Input is reflected but no merge/assign happens? → Not vulnerable
- `__proto__` key rejected by server? → Check `constructor.prototype` variant
- Polluted property does not affect any sink? → Informational
- Frozen / sealed prototype? → Use mitigation-bypass technique
