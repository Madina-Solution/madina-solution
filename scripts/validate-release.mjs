import { spawnSync } from "node:child_process";

const checks = [
  ["validate:navigation", "Navigation contract"],
  ["validate:integrity", "Integrity scan"],
  ["validate:media", "Media contract"],
  ["validate:social-auth", "Social auth contract"],
  ["validate:access", "Access control contract"],
  ["validate:persistence", "Media persistence contract"],
  ["validate:ui", "UI, branding and admin architecture contract"],
  ["validate:commerce", "Commerce, service configuration and media delivery contract"],
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
