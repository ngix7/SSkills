const fs = require('fs');
const path = require('path');
const BASE = path.join(__dirname, '..');
let errors = [];

const required = ['skill.json', 'README.md', 'router.md', 'safety.md', 'output-schema.json', 'sources.json'];
for (const f of required) {
  if (!fs.existsSync(path.join(BASE, f))) errors.push('Missing: ' + f);
}

const skill = JSON.parse(fs.readFileSync(path.join(BASE, 'skill.json'), 'utf8'));
if (!skill.name) errors.push('skill.json missing name');

const schema = JSON.parse(fs.readFileSync(path.join(BASE, 'output-schema.json'), 'utf8'));
if (!schema.properties) errors.push('output-schema.json missing properties');

const techDir = path.join(BASE, 'techniques');
if (fs.existsSync(techDir)) {
  const files = fs.readdirSync(techDir).filter(f => f.endsWith('.md'));
  if (files.length < 2) errors.push('techniques/ has < 2 files');
}

if (errors.length) {
  console.error('[FAIL] wayback-recon: ' + errors.join(', '));
  process.exit(1);
} else {
  console.log('[PASS] wayback-recon');
}
