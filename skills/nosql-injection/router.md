# NoSQL Injection Router

## Signal Classes
- `nosql-detected` — NoSQL query structure observed in request
- `nosql-confirmed` — Authentication bypass or data extraction confirmed
- `nosql-blind` — Blind injection detected via timing/boolean

## Triage Rules

1. Identify if the application uses MongoDB, CouchDB, Firebase, or another NoSQL DB
2. Check Content-Type: JSON endpoints are prime candidates
3. Test $ne / $gt / $regex operators in login forms and search endpoints
4. If no visible output, switch to blind techniques (time-based, boolean-based)
5. Use JSON body injection when URL parameters show no effect

## Technique Selection

| Signal | Technique |
|--------|-----------|
| Unknown DB type | detection |
| Login form, search box | mongodb-query-operator |
| No visible output | blind-nosql |
| JSON API endpoint | nosql-in-json |

## Rejection Rules

- Classic SQL error messages visible? → SQL injection, not NoSQL
- Query operators stripped by WAF? → Low confidence
- JSON body accepted but operators treated as strings? → Not injectable
- Conditional logic works with $ne / $gt but extraction fails? → Partial / low severity
