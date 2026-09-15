/**
 * Server-side allowlist sanitizer for CMS article HTML.
 * The browser editor is only a convenience; persisted HTML is never trusted.
 */
const ALLOWED_TAGS = new Set([
  "p","br","hr","strong","b","em","i","u","s","del","mark",
  "h2","h3","h4","h5","blockquote","pre","code",
  "ul","ol","li","a","img",
  "table","thead","tbody","tr","th","td",
  "div","span",
]);

const VOID_TAGS = new Set(["br","hr","img"]);
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href","title","target","rel"]),
  img: new Set(["src","alt","title","width","height"]),
  td: new Set(["colspan","rowspan"]),
  th: new Set(["colspan","rowspan"]),
};

function decodeEntities(value: string): string {
  return value
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function isSafeUrl(value: string, kind: "href" | "src"): boolean {
  const v = decodeEntities(value).trim();
  if (!v) return false;
  if (v.startsWith("/") && !v.startsWith("//")) return true;
  if (kind === "href" && /^(?:https?:|mailto:|tel:)/i.test(v)) return true;
  if (kind === "src" && /^https?:/i.test(v)) return true;
  return false;
}

function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function cleanAttrs(tag: string, raw: string): string {
  const allowed = ALLOWED_ATTRS[tag] ?? new Set<string>();
  if (!allowed.size) return "";
  const attrs: string[] = [];
  const attrRe = /([:@A-Za-z_][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
  let match: RegExpExecArray | null;
  while ((match = attrRe.exec(raw))) {
    const name = match[1].toLowerCase();
    if (!allowed.has(name) || name.startsWith("on")) continue;
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    if (name === "href" && !isSafeUrl(value, "href")) continue;
    if (name === "src" && !isSafeUrl(value, "src")) continue;
    if ((name === "target") && !["_blank","_self"].includes(value)) continue;
    if (name === "width" || name === "height" || name === "colspan" || name === "rowspan") {
      if (!/^\d{1,4}$/.test(value)) continue;
    }
    if (name === "rel") {
      attrs.push(`rel="${escapeText("noopener noreferrer nofollow")}"`);
      continue;
    }
    attrs.push(`${name}="${escapeText(value)}"`);
  }
  if (tag === "a" && attrs.some((item) => item.startsWith('target="_blank"')) && !attrs.some((item) => item.startsWith("rel="))) {
    attrs.push('rel="noopener noreferrer nofollow"');
  }
  return attrs.length ? ` ${attrs.join(" ")}` : "";
}

export function sanitizeArticleHtml(input: string | null | undefined): string {
  const source = String(input ?? "").trim();
  if (!source) return "";

  // Remove comments and dangerous containers including their contents.
  let html = source.replace(/<!--[\s\S]*?-->/g, "");
  html = html.replace(/<(script|style|iframe|object|embed|form|template|svg|math)(?:\s[^>]*)?>[\s\S]*?<\/\1\s*>/gi, "");
  html = html.replace(/<(script|style|iframe|object|embed|form|template|svg|math)(?:\s[^>]*)?\/?>/gi, "");

  return html.replace(/<\/?([A-Za-z][\w:-]*)([^>]*)>/g, (full, rawTag: string, rawAttrs: string) => {
    const tag = rawTag.toLowerCase();
    const closing = full.startsWith("</");
    if (!ALLOWED_TAGS.has(tag)) {
      return "";
    }
    if (closing) return VOID_TAGS.has(tag) ? "" : `</${tag}>`;
    return `<${tag}${cleanAttrs(tag, rawAttrs)}${VOID_TAGS.has(tag) ? " />" : ">"}`;
  });
}

/** Converts legacy plaintext articles to safe, readable HTML. */
export function articleContentToHtml(input: string | null | undefined): string {
  const raw = String(input ?? "");
  if (!raw.trim()) return "";
  if (/<(?:p|h2|h3|h4|ul|ol|blockquote|pre|img|table|div)\b/i.test(raw)) {
    return sanitizeArticleHtml(raw);
  }
  return raw
    .split(/\r?\n\s*\r?\n/)
    .map((block) => {
      const escaped = block.split(/\r?\n/).map(escapeText).join("<br />");
      return `<p>${escaped}</p>`;
    })
    .join("");
}
