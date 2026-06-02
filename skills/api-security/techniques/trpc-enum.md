# tRPC Enumeration

## Summary
Discover and test tRPC procedures.

## Detection

Look for tRPC endpoints:
```
/api/trpc
/api/trpc/*
/trpc
/_next/* (Next.js with tRPC)
```

## Techniques
- Send `GET /api/trpc/procedureName?batch=1&input={}`
- Check HTTP responses for error messages revealing procedure names
- Fuzz common procedure names: `user.list`, `user.get`, `admin.*`
- Try JSON-RPC batch requests
