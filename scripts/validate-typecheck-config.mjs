import fs from 'node:fs';
import process from 'node:process';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));

const typecheck = String(pkg.scripts?.typecheck ?? '');
const excluded = Array.isArray(tsconfig.exclude) ? tsconfig.exclude : [];
const problems = [];

if (!typecheck.includes('tsc --noEmit')) problems.push('typecheck script must run tsc --noEmit');
if (!typecheck.includes('--incremental false')) problems.push('typecheck script must disable stale incremental state');
if (!excluded.includes('.next')) problems.push('tsconfig must exclude .next generated/dev types from standalone tsc');

if (problems.length) {
  console.error('Typecheck configuration validation failed:');
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log('Typecheck configuration validation passed: standalone source typecheck excludes generated .next types and stale incremental state.');
