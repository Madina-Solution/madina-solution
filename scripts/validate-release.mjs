import { spawnSync } from "node:child_process";

const checks = [
  ["node scripts/validate-typecheck-config.mjs", "Typecheck configuration"],
  ["db:sync", "Database schema sync"],
  ["validate:navigation", "Navigation contract"],
  ["validate:integrity", "Integrity scan"],
  ["validate:media", "Media contract"],
  ["validate:social-auth", "Social auth contract"],
  ["validate:access", "Access control contract"],
  ["validate:persistence", "Media persistence contract"],
  ["validate:ui", "UI, branding and admin architecture contract"],
  ["validate:commerce", "Commerce, service configuration, review and media delivery contract"],
  ["validate:seo", "SEO, rich article editor and metadata contract"],
  ["validate:pages", "All-page source and regression contract"],
  ["validate:db-schema", "Database schema contract"],
  ["typecheck", "TypeScript"],
  ["lint", "ESLint"],
  ["build", "Production build"],
];

for (const [script, label] of checks) {
  console.log(`\n=== ${label} (${script}) ===`);
  const result = spawnSync("npm", ["run", script], { stdio: "inherit", shell: true });
  if (result.status !== 0) {
    console.error(`\nRELEASE CHECK FAILED: ${label}`);
    process.exit(result.status ?? 1);
  }
}

console.log("\nRELEASE CHECK PASSED: navigation, integrity, media, social auth, access control, persistence, UI/branding architecture, commerce/media delivery, database schema, TypeScript, lint and build.");
