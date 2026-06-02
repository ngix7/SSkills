# Race Conditions

Detection and exploitation of race condition vulnerabilities in concurrent environments.

## Techniques

| Technique | Description |
|-----------|-------------|
| [Detection](techniques/detection.md) | Finding race windows with concurrent requests and timing analysis |
| [Turbo Intruder](techniques/turbo-intruder.md) | Single-packet attack setup using Turbo Intruder |
| [Limit Overrun](techniques/limit-overrun.md) | Bypassing rate limits and one-time use constraints via races |
| [Time-Based Races](techniques/time-based-races.md) | TOCTOU exploitation in file operations and state transitions |
| [Race in Auth](techniques/race-in-auth.md) | Race conditions in OAuth, session creation, and authentication flows |

## Safety

Race condition testing can cause state corruption. Use isolated test accounts. Never test on production without explicit authorisation.

## Output

See [output-schema.json](output-schema.json) for structured findings.

## References

See [sources.json](sources.json).
