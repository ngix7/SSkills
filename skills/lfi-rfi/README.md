# File Inclusion & Path Traversal

Detection and exploitation of LFI, RFI, and path traversal vulnerabilities

## Techniques

| Technique | Description |
|-----------|-------------|
| [Path Traversal](techniques/path-traversal.md) | Directory traversal to read arbitrary files |
| [PHP Wrappers](techniques/php-wrappers.md) | php://filter, data://, expect://, etc. |
| [Log Poisoning](techniques/log-poisoning.md) | Inject PHP into logs then include |
| [Remote File Inclusion](techniques/rfi.md) | Include remote files |
| [Windows Traversal](techniques/windows-traversal.md) | Windows-specific path traversal |

## Safety

See [safety.md](safety.md) before testing.

## Output

See [output-schema.json](output-schema.json) for structured findings.

## References

See [sources.json](sources.json).
