import { spawnSync } from "node:child_process";

const checks = [
  ["validate:navigation", "Navigation contract"],
  ["validate:integrity", "Integrity scan"],
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

console.log("\nRELEASE CHECK PASSED: navigation, integrity, TypeScript, lint and build.");
