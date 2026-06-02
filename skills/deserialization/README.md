# Insecure Deserialization

Detection and exploitation of insecure deserialization in PHP, Java, Python, and Ruby applications

## Techniques

| Technique | Description |
|-----------|-------------|
| [Detection](techniques/detection.md) | Identify serialised data, magic methods, and error-based leaks |
| [PHP Deserialization](techniques/php-deserialization.md) | PHP unserialize() RCE via gadget chains and PHPGGC |
| [Java Deserialization](techniques/java-deserialization.md) | Java deserialisation RCE via ysoserial |
| [Python Pickle](techniques/python-pickle.md) | Python pickle deserialisation RCE via __reduce__ |
| [Ruby Marshal](techniques/ruby-marshal.md) | Ruby MARSHAL deserialisation and exploitation |

## Output

See [output-schema.json](output-schema.json) for structured findings.

## References

See [sources.json](sources.json).
