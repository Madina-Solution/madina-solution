const ALLOWED_TAGS = new Set(["p","br","h1","h2","h3","h4","h5","h6","strong","b","em","i","u","s","del","ul","ol","li","blockquote","pre","code","a","img","table","thead","tbody","tr","th","td","hr","div","span","figure","figcaption"]);

export function sanitizeRichHtml(input: string | null | undefined): string {
  if (!input) return "";
  let html = input.replace(/<!--[\s\S]*?-->/g, "");
  html = html.replace(/<\s*(script|style|iframe|object|embed|form|svg|math|link|meta|base|template)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "");
  html = html.replace(/<\/?\s*([a-z0-9-]+)([^>]*)>/gi, (full, rawTag: string, rawAttrs: string) => {
    const tag = rawTag.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return tag === "br" || tag === "hr" ? `<${tag}>` : "";
    if (full.startsWith("</")) return `</${tag}>`;
    const attrs: string[] = [];
    const attrRe = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
    for (const match of rawAttrs.matchAll(attrRe)) {
      const name = String(match[1]).toLowerCase();
      const value = String(match[3] ?? match[4] ?? match[5] ?? "");
      if (name.startsWith("on") || name === "style" || name === "srcset") continue;
      const allowed =
        (tag === "a" && ["href","target","rel","title"].includes(name)) ||
        (tag === "img" && ["src","alt","title","width","height","loading"].includes(name)) ||
        ((tag === "th" || tag === "td") && ["colspan","rowspan"].includes(name)) ||
        (name === "class" && ["p","h1","h2","h3","h4","h5","h6","div","span","figure","figcaption","table","thead","tbody","tr","ul","ol","li","blockquote","pre","code"].includes(tag));
      if (!allowed || /^(javascript:|vbscript:|data:text\/html)/i.test(value)) continue;
      attrs.push(` ${name}="${value.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}"`);
    }
    if (tag === "a" && !attrs.some((a)=>a.startsWith(" rel="))) attrs.push(' rel="noopener noreferrer"');
    if (tag === "img" && !attrs.some((a)=>a.startsWith(" loading="))) attrs.push(' loading="lazy"');
    return `<${tag}${attrs.join("")}>`;
  });
  return html.trim();
}
