const TAGS = new Set(["p","br","h1","h2","h3","h4","h5","h6","strong","b","em","i","u","s","del","ul","ol","li","blockquote","pre","code","a","img","table","thead","tbody","tr","th","td","hr","div","span","figure","figcaption"]);
export function sanitizeRichHtml(input: string | null | undefined): string {
  if (!input) return "";
  let html = input.replace(/<!--<!--[\s\S]*?-->/g, "").replace(/<\/?\s*(script|style|iframe|object|embed|form|svg|math|link|meta|base|template)[^>]*>[\s\S]*?<\/?\s*\1\s*>/gi, "");
  html = html.replace(/<\/?\s*([a-z0-9-]+)([^>]*)>/gi, (full, rawTag, rawAttrs) => {
    const tag = String(rawTag).toLowerCase(); if (!TAGS.has(tag)) return tag === "br" || tag === "hr" ? `<${tag}>` : ""; if (full.startsWith("</")) return `</${tag}>`;
    const attrs: string[] = []; const re=/([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
    for (const m of rawAttrs.matchAll(re)) { const name=String(m[1]).toLowerCase(); const value=String(m[3]??m[4]??m[5]??""); const ok=(tag==="a"&&["href","target","rel","title"].includes(name))||(tag==="img"&&["src","alt","title","width","height","loading"].includes(name))||((tag==="th"||tag==="td")&&["colspan","rowspan"].includes(name)); if (ok&&!name.startsWith("on")&&!/^(javascript:|vbscript:|data:text\/html)/i.test(value)) attrs.push(` ${name}="${value.replace(/&/g,"&amp;").replace(/"/g,"&quot;")}"`); }
    if(tag==="img"&&!attrs.some(a=>a.startsWith(" alt="))) attrs.push(' alt=""'); if(tag==="img"&&!attrs.some(a=>a.startsWith(" loading="))) attrs.push(' loading="lazy"'); if(tag==="a"&&!attrs.some(a=>a.startsWith(" rel="))) attrs.push(' rel="noopener noreferrer"'); return `<${tag}${attrs.join("")}>`;
  }); return html.trim();
}
