const { execSync } = require('child_process');
const skills = ['xss','sql-injection','csrf','ssrf','authentication-bypass','idor','xxe','command-injection','lfi-rfi','api-security','false-positive-validation','wayback-recon'];
let failed = 0;
for (const s of skills) {
  try {
    execSync(`node skills/${s}/scripts/validate.js`, { stdio: 'inherit' });
    console.log(`[OK] ${s}`);
  } catch(e) {
    console.error(`[FAIL] ${s}`);
    failed++;
  }
}
process.exit(failed ? 1 : 0);
