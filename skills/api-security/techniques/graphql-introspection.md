# GraphQL Introspection

## Summary
Extract GraphQL schema and find vulnerabilities.

## Query

```graphql
query {
  __schema {
    types {
      name
      fields {
        name
        type {
          name
        }
      }
    }
  }
}
```

## Techniques
- Disabled introspection? Try brute-forcing field names
- Look for deprecated fields, `__` prefixed fields
