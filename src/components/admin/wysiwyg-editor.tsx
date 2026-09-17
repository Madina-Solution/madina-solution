"use client";

import * as React from "react";
import { Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon, Table2, AlignLeft, AlignCenter, AlignRight, Undo2, Redo2, RemoveFormatting, Maximize2, Minimize2, Eye, Code, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { value: string; onChange: (html: string) => void; placeholder?: string; minHeight?: number; label?: string; helpText?: string; className?: string };
const ALLOWED = new Set(["P","BR","H1","H2","H3","H4","H5","H6","STRONG","B","EM","I","U","S","DEL","UL","OL","LI","BLOCKQUOTE","PRE","CODE","A","IMG","TABLE","THEAD","TBODY","TR","TH","TD","HR","DIV","SPAN","FIGURE","FIGCAPTION"]);

function sanitize(input: string) {
  const root = document.createElement("div"); root.innerHTML = input;
  const walk = (parent: Element) => {
    for (const node of Array.from(parent.children)) {
      if (!ALLOWED.has(node.tagName)) { node.replaceWith(document.createTextNode(node.textContent || "")); continue; }
      for (const attr of Array.from(node.attributes)) {
        const name = attr.name.toLowerCase(); const value = attr.value.trim();
        const keep = (node.tagName === "A" && ["href","target","rel","title"].includes(name)) ||
          (node.tagName === "IMG" && ["src","alt","title","width","height","loading"].includes(name)) ||
          ((node.tagName === "TH" || node.tagName === "TD") && ["colspan","rowspan"].includes(name));
        if (!keep || name.startsWith("on") || /^(javascript:|vbscript:|data:text\/html)/i.test(value)) node.removeAttribute(attr.name);
      }
      if (node.tagName === "A") node.setAttribute("rel", "noopener noreferrer");
      if (node.tagName === "IMG") { node.setAttribute("loading", "lazy"); if (!node.getAttribute("alt")) node.setAttribute("alt", ""); }
      walk(node);
    }
  };
  walk(root); return root.innerHTML;
}

export function RichTextEditor({ value, onChange, placeholder = "Tulis konten…", minHeight = 320, label, helpText, className }: Props) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [sourceMode, setSourceMode] = React.useState(false); const [fullscreen, setFullscreen] = React.useState(false);
  React.useEffect(() => { if (editorRef.current && !sourceMode && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value; }, [value, sourceMode]);
  const commit = React.useCallback(() => { if (!editorRef.current) return; const safe = sanitize(editorRef.current.innerHTML); onChange(safe); if (safe !== editorRef.current.innerHTML) editorRef.current.innerHTML = safe; }, [onChange]);
  const run = (name: string, arg?: string) => { editorRef.current?.focus(); document.execCommand(name, false, arg); commit(); };
  const action = (name: string) => {
    if (name === "link") { const v = window.prompt("URL tautan", "https://"); if (v) run("createLink", v.trim()); return; }
    if (name === "image") { const v = window.prompt("URL gambar"); if (v) run("insertImage", v.trim()); return; }
    if (name === "table") { run("insertHTML", '<table><tbody><tr><th>Kolom 1</th><th>Kolom 2</th></tr><tr><td>Isi</td><td>Isi</td></tr></tbody></table><p><br></p>'); return; }
    if (name.startsWith("block:")) { run("formatBlock", name.slice(6)); return; }
    run(name);
  };
  const items = [[Bold,"Tebal","bold"],[Italic,"Miring","italic"],[Underline,"Garis bawah","underline"],[Strikethrough,"Coret","strikeThrough"],[Heading1,"Heading 1","block:H1"],[Heading2,"Heading 2","block:H2"],[Heading3,"Heading 3","block:H3"],[List,"Daftar","insertUnorderedList"],[ListOrdered,"Daftar bernomor","insertOrderedList"],[Quote,"Kutipan","block:BLOCKQUOTE"],[LinkIcon,"Tautan","link"],[ImageIcon,"Gambar","image"],[Table2,"Tabel","table"],[AlignLeft,"Rata kiri","justifyLeft"],[AlignCenter,"Rata tengah","justifyCenter"],[AlignRight,"Rata kanan","justifyRight"],[Minus,"Garis","insertHorizontalRule"],[Undo2,"Urungkan","undo"],[Redo2,"Ulangi","redo"],[RemoveFormatting,"Bersihkan format","removeFormat"]] as const;
  return <div className={cn("space-y-2", fullscreen && "fixed inset-3 z-[70] flex flex-col rounded-2xl bg-white p-3 shadow-2xl", className)}>
    {label && <div><label className="block text-sm font-semibold text-dark">{label}</label>{helpText && <p className="mt-1 text-xs text-dark-500">{helpText}</p>}</div>}
    <div className="overflow-hidden rounded-2xl border border-dark-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-1 border-b border-dark-100 bg-dark-50 p-2" role="toolbar" aria-label={label ? `Format ${label}` : "Format konten"}>
        {items.map(([Icon,title,cmd]) => <button key={title} type="button" title={title} aria-label={title} onMouseDown={(e)=>e.preventDefault()} onClick={()=>action(cmd)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-dark-600 hover:bg-white hover:text-dark focus:outline-none focus:ring-2 focus:ring-primary/30"><Icon className="h-4 w-4"/></button>)}
        <span className="mx-1 h-6 w-px bg-dark-200" aria-hidden="true"/>
        <button type="button" onClick={()=>setSourceMode(v=>!v)} aria-pressed={sourceMode} className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-dark-600 hover:bg-white">{sourceMode?<Eye className="h-4 w-4"/>:<Code className="h-4 w-4"/>}{sourceMode?"Preview":"HTML"}</button>
        <button type="button" onClick={()=>setFullscreen(v=>!v)} aria-label={fullscreen?"Keluar fullscreen":"Fullscreen"} className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-dark-600 hover:bg-white">{fullscreen?<Minimize2 className="h-4 w-4"/>:<Maximize2 className="h-4 w-4"/>}</button>
      </div>
      {sourceMode ? <textarea aria-label={label ? `HTML ${label}` : "HTML sumber"} value={value} onChange={(e)=>onChange(e.target.value)} spellCheck={false} className="block w-full resize-none border-0 bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100 outline-none" style={{minHeight}}/> :
        <div ref={editorRef} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" aria-label={label || "Editor konten"} data-placeholder={placeholder} onInput={commit} onBlur={commit} className="rich-editor-content overflow-auto p-5 text-sm leading-7 text-dark outline-none" style={{minHeight}}/>}
    </div>
  </div>;
}
