import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const appDir = path.join(root, "src", "app");
const sourceDirs = [path.join(root, "src", "app"), path.join(root, "src", "components")];

function walk(dir) {
  const result = [];
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...walk(full));
    else if (/\.(tsx|ts)$/.test(entry.name)) result.push(full);
  }
  return result;
}

function routeBaseFromPage(file) {
  let rel = path.relative(appDir, file).replaceAll(path.sep, "/");
  rel = rel.replace(/\/page\.tsx$/, "");
  rel = rel.split("/").filter((segment) => segment && !/^\([^/]+\)$/.test(segment) && !/^\[[^/]+\]$/.test(segment)).join("/");
  return rel ? `/${rel}` : "/";
}

const pageFiles = walk(appDir).filter((f) => f.endsWith("/page.tsx"));
const routes = new Set(pageFiles.map(routeBaseFromPage));
const errors = [];
const warnings = [];

for (const file of walk(appDir)) {
  const source = fs.readFileSync(file, "utf8");
  const rel = path.relative(root, file).replaceAll(path.sep, "/");

  if (source.includes("<Link") && /<Link[\s\S]*?<\/Link>/.test(source)) {
    const links = source.matchAll(/<Link\b[^>]*>[\s\S]*?<\/Link>/g);
    for (const match of links) {
      const block = match[0];
      if (/<(?:button|Button)\b/.test(block)) {
        errors.push(`${rel}: interactive Button nested inside Link`);
        break;
      }
    }
  }

  if (source.includes("dangerouslySetInnerHTML") && file.includes("(public)/blog/[slug]/page.tsx") && !source.includes("articleContentToHtml")) {
    errors.push(`${rel}: blog HTML render is not protected by sanitizer`);
  }
}

// Public catalog must use authoritative approved-review aggregates, never legacy cached fields.
for (const file of walk(path.join(appDir, "(public)"))) {
  const rel = path.relative(root, file).replaceAll(path.sep, "/");
  if (!file.includes("/products/") && !file.includes("/home/")) continue;
  const source = fs.readFileSync(file, "utf8");
  if (/products\.reviewCount|products\.rating/.test(source) && !file.includes("/products/[slug]/page.tsx")) {
    errors.push(`${rel}: public product surface reads legacy products.rating/reviewCount`);
  }
}

// Check literal internal hrefs against known static/dynamic route bases.
for (const dir of sourceDirs) {
  for (const file of walk(dir)) {
    const source = fs.readFileSync(file, "utf8");
    const rel = path.relative(root, file).replaceAll(path.sep, "/");
    for (const match of source.matchAll(/href\s*=\s*["'](\/[^"'#?]*)["']/g)) {
      const href = match[1].replace(/\/$/, "") || "/";
      if (href.startsWith("/api/") || href.startsWith("/_next/")) continue;
      let valid = routes.has(href);
      if (!valid) {
        for (const route of routes) {
          const routeParts = route.split("/").filter(Boolean);
          const hrefParts = href.split("/").filter(Boolean);
          if (routeParts.length === hrefParts.length && routeParts.every((p, i) => p === hrefParts[i] || p.startsWith("["))) {
            valid = true;
            break;
          }
        }
      }
      if (!valid) warnings.push(`${rel}: literal internal href ${href} has no matching page route`);
    }
  }
}

console.log(`Page inventory: ${pageFiles.length} page.tsx files, ${routes.size} normalized routes.`);
if (warnings.length) {
  console.log(`Warnings: ${warnings.length}`);
  for (const warning of warnings.slice(0, 30)) console.log(`WARN ${warning}`);
}
if (errors.length) {
  console.error(`Page validation failed: ${errors.length} error(s)`);
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exit(1);
}
console.log("Page validation passed: no known nested-interaction, unsafe blog HTML, or legacy public review metric regressions.");
