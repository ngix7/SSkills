# Insecure Deserialization Router

## Signal Classes
- `ser-detected` — Serialised data detected in request or response
- `ser-confirmed` — Deserialisation confirmed via error or behaviour change
- `ser-rce` — Remote code execution achieved

## Triage Rules

1. Scan all POST/PUT bodies, cookies, and hidden form fields for serialised formats
2. Check for base64-encoded objects, Java serialisation headers (\xAC\xED), PHP session serialisation
3. Modify serialised objects and observe error messages for class loading clues
4. Match language-specific payloads from technique cards
5. Use gadget chains when native classes are unavailable

## Technique Selection

| Signal | Technique |
|--------|-----------|
| Unknown serialised blob | detection |
| PHP session / object stream | php-deserialization |
| Java serialisation header (\xAC\xED) | java-deserialization |
| Python pickle / base64 | python-pickle |
| Ruby MARSHAL dump | ruby-marshal |

## Rejection Rules

- Input not user-controllable? → Reject
- No observable difference between modified and original? → Low confidence
- Serialised data present but application validates integrity (HMAC)? → Not exploitable
- Error message reveals class but no gadget chain available? → Informational
