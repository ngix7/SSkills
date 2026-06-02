# Safety Gates: SSTI

## Hard Gates

- ⛔ **No RCE payload execution** without explicit authorization per-command
- ⛔ **No destructive commands** (rm, dd, mkfs, reboot, poweroff)
- ⛔ **No reading /etc/shadow** or other protected system files
- ⛔ **No installing backdoors or webshells**
- ⛔ **No resource exhaustion** (infinite loops in templates)
- ⛔ **No data exfiltration to external servers** without authorization

## Required Authorization

SSTI almost always leads to RCE. Before exploiting:
- [ ] Written authorization to execute commands on the target
- [ ] Emergency contact for the target identified
- [ ] Specific commands pre-approved

## RCE Payload Execution Policy

| Action | Permitted? |
|--------|-----------|
| `id` | Usually safe — confirm RCE |
| `uname -a` | Usually safe — confirm OS |
| `ls /etc/passwd` | Usually safe — confirm file read |
| `cat /etc/passwd` | Requires authorization |
| `cat /etc/shadow` | ❌ Never |
| Reverse shell | ❌ Never |
| rm /dd /format | ❌ Never |

## Reporting
Report the SSTI vulnerability itself. Demonstrating `id` is sufficient proof of RCE. Do not demonstrate full shell access unless explicitly requested.
