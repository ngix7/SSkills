# DNS Brute Force

## Summary
Brute-force subdomains using a wordlist of common names. Active technique — sends DNS queries.

## Basic

```bash
# Using puredns (fast, handles wildcards)
puredns bruteforce wordlist.txt target.com -r resolvers.txt

# Using dnsx
cat wordlist.txt | dnsx -domain target.com -a -resp-only
```

## Wordlists

```bash
# Best wordlists (install once):
# apt install seclists  or  git clone https://github.com/danielmiessler/SecLists

WORDLISTS=(
  /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt        # 110k
  /usr/share/seclists/Discovery/DNS/bitquark-subdomains-top100000.txt        # 100k
  /usr/share/seclists/Discovery/DNS/combined_subdomains.txt                  # 238k
  /usr/share/seclists/Discovery/DNS/deepmagic.com-prefixes-top50000.txt      # 50k
  /usr/share/seclists/Discovery/DNS/namelist.txt                              # 105k
)

# Custom minimal (fast first pass):
cat << 'EOF' > quick_words.txt
www
mail
admin
api
app
dev
staging
test
beta
blog
cdn
cdn2
static
assets
img
images
media
m
mobile
portal
login
auth
sso
identity
accounts
support
help
docs
wiki
git
jira
confluence
jenkins
grafana
prometheus
kibana
elastic
redis
db
mysql
postgres
mongo
devops
monitor
status
health
metrics
logs
backup
old
v1
v2
v3
api-dev
api-staging
internal
corp
hr
pay
payment
billing
invoice
gateway
bank
checkout
shop
store
admin-console
console
dashboard
analytics
report
reports
track
tracking
webhook
webhooks
callback
notification
notify
alerts
updates
download
files
upload
transfer
stream
live
video
tv
radio
cdn
nfs
s3
storage
cloud
config
settings
configuration
gateway
router
proxy
sandbox
demo
app-dev
www-dev
dev-api
staging-api
EOF
```

## Using Amass

```bash
# Amass with brute-force
amass enum -d target.com -brute -w quick_words.txt -o amass_subs.txt

# Amass with all sources + brute
amass enum -d target.com -brute -w combined_subdomains.txt \
  -o amass_all.txt -config config.ini
```

## Using Subfinder

```bash
# Subfinder includes passive sources + optional brute
subfinder -d target.com -all -o subs_passive.txt

# With brute-force (small internal wordlist)
subfinder -d target.com -all -b -o subs_brute.txt
```

## Resolver Setup

```bash
# Use trusted public resolvers
cat << 'EOF' > resolvers.txt
1.1.1.1
8.8.8.8
8.8.4.4
9.9.9.9
208.67.222.222
208.67.220.220
EOF

# Validate resolvers (good practice)
dnsx -l resolvers.txt -a -resp-only -o valid_resolvers.txt
```

## Notes
- Without a good wordlist you'll miss most results
- Start small (quick_words.txt), then escalate to full lists
- Use `puredns` if wildcards are an issue (it filters them)
- Rate limit to avoid being blocked: `-rl 50`
