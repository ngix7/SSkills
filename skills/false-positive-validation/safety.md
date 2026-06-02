# Safety Gates: False Positive Validation

## Hard Gates

- ⛔ Never report a finding without confirming it's NOT a false positive
- ⛔ Never report "potential" or "maybe" vulnerabilities as confirmed
- ⛔ Never rely on a single test run for confirmation
- ⛔ Never ignore benign comparisons

## Validation Requirement

Every finding must pass through:
1. General triage filters
2. Vulnerability-specific validation
3. Confirmation criteria checklist
4. Confidence scoring

## Manual-Only Boundaries

- Confirming stored XSS in another user's browser
- CSRF confirmation in a real browser session
- Complex chained exploits requiring user interaction
