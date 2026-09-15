import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const APP = path.join(ROOT, "src", "app");
const required = [
  "src/lib/seo.ts",
  "src/app/robots.ts",
  "src/app/sitemap.ts",
  "src/app/manifest.ts",
  "src/app/viewport.ts",
  "src/app/icon.svg",
  "src/app/apple-icon.svg",
  "src/app/opengraph-image.tsx",
  "src/app/twitter-image.tsx",
];
const failures = [];
for (const rel of required) if (!fs.existsSync(path.join(ROOT, rel))) failures.push(`Missing ${rel}`);
const rootLayout = fs.readFileSync(path.join(APP, "layout.tsx"), "utf8");
for (const token of ["metadataBase", "openGraph", "twitter", "manifest", "getSiteUrl"]) {
  if (!rootLayout.includes(token)) failures.push(`Root metadata missing ${token}`);
}
const proxy = fs.readFileSync(path.join(APP, "../proxy.ts"), "utf8");
if (!proxy.includes("X-Robots-Tag")) failures.push("Private-route X-Robots-Tag missing");
const settingsApi = fs.readFileSync(path.join(APP, "api/admin/settings/route.ts"), "utf8");
for (const key of ["seo_title", "seo_description", "seo_keywords", "seo_og_image"]) {
  if (!settingsApi.includes(key)) failures.push(`Admin SEO key missing ${key}`);
}
const articlePage = fs.readFileSync(path.join(APP, "(public)", "blog", "[slug]", "page.tsx"), "utf8");
const articleApi = fs.readFileSync(path.join(APP, "api/admin/articles/route.ts"), "utf8");
const editor = fs.readFileSync(path.join(ROOT, "src/components/admin/rich-text-editor.tsx"), "utf8");
for (const token of ["seoTitle", "seoDescription", "seoKeywords", "focusKeyword", "canonicalUrl", "noIndex"]) {
  if (!articleApi.includes(token)) failures.push(`Article API missing ${token}`);
}
for (const token of ["buildPageMetadata", "articleContentToHtml", "ArticleSchema"]) {
  if (!articlePage.includes(token)) failures.push(`Public article SEO/content integration missing ${token}`);
}
for (const token of ["Mode HTML aktif", "insertLink", "insertImage", "contentEditable"]) {
  if (!editor.includes(token)) failures.push(`Rich editor capability missing ${token}`);
}
const sitemap = fs.readFileSync(path.join(APP, "sitemap.ts"), "utf8");
if (!sitemap.includes("filter((a) => !a.noIndex)")) failures.push("Sitemap should exclude noindex articles");

if (failures.length) {
  console.error("SEO validation failed:\n- " + failures.join("\n- "));
  process.exit(1);
}
console.log("SEO validation passed: metadata, canonical infrastructure, robots, sitemap, manifest, social images, private-route controls, and admin SEO settings are present.");
