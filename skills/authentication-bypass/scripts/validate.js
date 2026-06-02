const fs = require('fs');
const path = require('path');
const BASE = path.join(__dirname, '..');
let errors = [];

// Check required files
const required = ['skill.json', 'README.md', 'router.md', 'output-schema.json', 'sources.json'];
for (const f of required) {
  if (!fs.existsSync(path.join(BASE, f))) errors.push('Missing: ' + f);
}

// Check skill.json
const skill = JSON.parse(fs.readFileSync(path.join(BASE, 'skill.json'), 'utf8'));
if (!skill.name) errors.push('skill.json missing name');
if (!skill.description) errors.push('skill.json missing description');

// Check output-schema.json
const schema = JSON.parse(fs.readFileSync(path.join(BASE, 'output-schema.json'), 'utf8'));
if (!schema.properties) errors.push('output-schema.json missing properties');

// Check techniques directory
const techDir = path.join(BASE, 'techniques');
if (fs.existsSync(techDir)) {
  const files = fs.readdirSync(techDir).filter(f => f.endsWith('.md'));
  if (files.length < 2) errors.push('techniques/ has < 2 files');
} else {
  errors.push('Missing techniques/ directory');
}

if (errors.length) {
  console.error('[FAIL] ' + path.basename(BASE) + ': ' + errors.join(', '));
  process.exit(1);
} else {
  console.log('[PASS] ' + path.basename(BASE));
}
