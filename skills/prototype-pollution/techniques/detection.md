# Prototype Pollution Detection

## Summary
Prototype pollution occurs when an attacker-controlled property is merged into `Object.prototype`. Detection focuses on finding recursive merge, assign, clone, or copy operations that accept user keys.

## Vulnerable Patterns

### Deep Merge
```javascript
// jQuery.extend — classic PP vector
$.extend(true, {}, JSON.parse(userInput));

// Lodash merge
_.merge({}, JSON.parse(userInput));

// Hand-rolled recursive merge
function merge(a, b) {
  for (let key in b) {
    if (typeof b[key] === 'object') merge(a[key], b[key]);
    else a[key] = b[key];
  }
}
```

### Object.assign
```javascript
Object.assign({}, userInput);
// Only pollutes if __proto__ is enumerable or via constructor.prototype
```

### Clone operations
```javascript
// Structured clone
JSON.parse(JSON.stringify(userInput));  // safe — strips __proto__

// Spread operator
{ ...userInput };  // safe — __proto__ is ignored

// Custom clone
function clone(obj) {
  if (typeof obj !== 'object') return obj;
  const copy = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    copy[key] = clone(obj[key]);   // VULNERABLE if key is __proto__
  }
  return copy;
}
```

## Probes — Client-Side

Open browser console and run:

```javascript
// Probe 1: __proto__ key
const a = {};
const b = JSON.parse('{"__proto__": {"polluted": "true"}}');
Object.assign(a, b);
// or assume merge happens on the server
console.log({}.polluted);
// undefined → not polluted, "true" → CONFIRMED

// Probe 2: constructor.prototype
const c = JSON.parse('{"constructor": {"prototype": {"polluted2": "true"}}}');
// If merge recurses into constructor.prototype
console.log({}.polluted2);

// Probe 3: Check after every page interaction
// Set a breakpoint and watch for new properties on {}
```

## Probes — Server-Side

```bash
# Send JSON with __proto__ key
curl -X POST https://target.com/api/data \
  -H "Content-Type: application/json" \
  -d '{"__proto__": {"polluted": true}}'

# Check via another endpoint
curl https://target.com/api/status
# Look for {"polluted": true} in response

# Alternative: constructor.prototype
curl -X POST https://target.com/api/data \
  -d '{"constructor": {"prototype": {"polluted": true}}}'
```

## Common PP-Vulnerable Libraries

| Library | Function | CVE |
|---------|----------|-----|
| lodash | `_.merge`, `_.defaultsDeep` | CVE-2018-3721, CVE-2019-10744 |
| jQuery | `$.extend(true, ...)` | CVE-2019-11358 |
| mongoose | `Schema.prototype` | CVE-2022-2564 |
| node-fetch | `Headers` class | CVE-2022-0235 |
| minimist | `argv` parser | CVE-2020-7598 |
| doT | `doT.template` | Various |

## Detection Script — Browser

```javascript
// Run after every page navigation
(function detectPP() {
  const before = Object.keys(Object.prototype).length;
  setTimeout(() => {
    const now = Object.keys(Object.prototype).length;
    if (now > before) {
      console.warn('Potential PP: new keys on Object.prototype');
    }
  }, 3000);
})();
```

## Remediation
- Use `Object.create(null)` for maps that accept user keys
- Strip `__proto__` and `constructor` keys before merge operations
- Use `JSON.parse()` with a reviver that discards dangerous keys
- Keep dependencies updated (lodash >= 4.17.21, jQuery >= 3.5.0)
