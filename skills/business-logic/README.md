# Business Logic Vulnerabilities

Detection and exploitation of business logic flaws including workflow bypass, 2FA skip, price manipulation, and rate limit logic errors.

## Techniques

| Technique | Description |
|-----------|-------------|
| [Workflow Bypass](techniques/workflow-bypass.md) | Skipping or reordering multi-step processes |
| [2FA Skip](techniques/2fa-skip.md) | Direct navigation, parameter manipulation, session reuse |
| [Price Manipulation](techniques/price-manipulation.md) | Negative values, integer overflow, currency confusion |
| [Rate Limit Bypass](techniques/rate-limit-logic.md) | Reset on success, race window, header manipulation |

## Output

See [output-schema.json](output-schema.json) for structured findings.

## References

See [sources.json](sources.json).

