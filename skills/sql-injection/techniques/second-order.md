# Second-Order SQL Injection

## Summary
Payload stored first, then executed in a different SQL query.

## Technique
1. Store malicious input (e.g., username: `admin'-- -`)
2. Trigger a different query that uses the stored value unsafely
