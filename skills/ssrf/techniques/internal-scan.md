# Internal Network Scan

## Summary
Scan internal networks via SSRF.

## Technique
```
# Probe common internal IPs
http://127.0.0.1:8080
http://127.0.0.1:3000
http://127.0.0.1:9200 (Elasticsearch)
http://localhost:6379 (Redis)
http://10.0.0.1:443
http://172.16.0.1:443
http://192.168.1.1:443
```
