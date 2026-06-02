# Web Cache Poisoning & Deception

Detection and exploitation of web cache poisoning and cache deception vulnerabilities to deliver malicious content to end users.

## Techniques

| Technique | Description |
|-----------|-------------|
| [Unkeyed Inputs](techniques/unkeyed-inputs.md) | Finding headers, cookies, and parameters not included in the cache key |
| [Cache Deception](techniques/cache-deception.md) | Tricking the cache into storing sensitive authenticated pages |
| [Poison to Reflected XSS](techniques/poison-to-rfp.md) | Using an unkeyed header reflected in the response to poison the cache |
| [Poison with Stored Payloads](techniques/poison-to-stored.md) | Poisoning the cache by injecting a stored payload via a separate endpoint |

## Safety

Cache poisoning delivers malicious content to all users who hit the poisoned cache. Never test cache poisoning on production systems without isolated cache environments.

## Output

See [output-schema.json](output-schema.json) for structured findings.

## References

See [sources.json](sources.json).
