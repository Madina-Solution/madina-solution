"use client";

import * as React from "react";
import {
  Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code2, Link as LinkIcon, Image as ImageIcon,
  Table2, AlignLeft, AlignCenter, AlignRight, Undo2, Redo2, RemoveFormatting,
  Maximize2, Minimize2, Eye, Code, Minus
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  label?: string;
  helpText?: string;
  className?: string;
};

const ALLOWED_TAGS = new Set(["P","BR","H1","H2","H3","H4","H5","H6","STRONG","B","EM","I","U","S","DEL","UL","OL","LI","BLOCKQUOTE","PRE","CODE","A","IMG","TABLE","THEAD","TBODY","TR","TH","TD","HR","DIV","SPAN","FIGURE","FIGCAPTION"]);

function sanitizeHtml(input: string): string {
  if (!input) return "";
  const container = document.createElement("div");
  container.innerHTML = input;
  const walk = (parent: Element) => {
    for (const node of Array.from(parent.children)) {
      if (!ALLOWED_TAGS.has(node.tagName)) {
        node.replaceWith(document.createTextNode(node.textContent || ""));
        continue;
      }
      for (const attr of Array.from(node.attributes)) {
        const name = attr.name.toLowerCase();
        const value = attr.value.trim();
        const allowed =
          (node.tagName === "A" && ["href","target","rel","title"].includes(name)) ||
          (node.tagName === "IMG" && ["src","alt","title","width","height","loading"].includes(name)) ||
          (["TH","TD"].includes(node.tagName) && ["colspan","rowspan"].includes(name)) ||
          (["DIV","SPAN","P","H1","H2","H3","H4","H5","H6","FIGURE","FIGCAPTION","TABLE","THEAD","TBODY","TR","UL","OL","LI","BLOCKQUOTE","PRE","CODE"].includes(node.tagName) && name === "class");
        if (!allowed || /^javascript:/i.test(value) || /^data:text\/html/i.test(value)) node.removeAttribute(attr.name);
      }
      if (node.tagName === "A") {
        node.setAttribute("rel", "noopener noreferrer");
        if (!node.getAttribute("target")) node.setAttribute("target", "_blank");
      }
      if (node.tagName === "IMG") node.setAttribute("loading", "lazy");
      walk(node);
    }
  };
  walk(container);
  return container.innerHTML;
}

export function RichTextEditor({ value, onChange, placeholder = "Tulis konten…", minHeight = 320, label, helpText, className }: Props) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [sourceMode, setSourceMode] = React.useState(false);
  const [fullscreen, setFullscreen] = React.useState(false);

  React.useEffect(() => {
    if (!editorRef.current || sourceMode) return;
    if (editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value;
  }, [value, sourceMode]);

  const commit = React.useCallback(() => {
    if (!editorRef.current) return;
    const safe = sanitizeHtml(editorRef.current.innerHTML);
    onChange(safe);
    if (editorRef.current.innerHTML !== safe) editorRef.current.innerHTML = safe;
  }, [onChange]);

  const command = React.useCallback((name: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(name, false, val);
    commit();
  }, [commit]);

  const promptLink = () => {
    const url = window.prompt("URL tautan", "https://");
    if (url) command("createLink", url);
  };
  const promptImage = () => {
    const url = window.prompt("URL gambar (Cloudinary / media publik)");
    if (url) {
      editorRef.current?.focus();
      document.execCommand("insertImage", false, url);
      commit();
    }
  };
  const insertTable = () => {
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, '<table class="w-full border-collapse"><tbody><tr><th class="border p-2 text-left">Kolom 1</th><th class="border p-2 text-left">Kolom 2</th></tr><tr><td class="border p-2">Isi</td><td class="border p-2">Isi</td></tr></tbody></table><p><br></p>');
    commit();
  };
  const toolbar = [
    [Bold,"Tebal",() => command("bold")],[Italic,"Miring",() => command("italic")],[Underline,"Garis bawah",() => command("underline")],[Strikethrough,"Coret",() => command("strikeThrough")],
    [Heading1,"Heading 1",() => command("formatBlock","H1")],[Heading2,"Heading 2",() => command("formatBlock","H2")],[Heading3,"Heading 3",() => command("formatBlock","H3")],
    [List,"Daftar",() => command("insertUnorderedList")],[ListOrdered,"Daftar bernomor",() => command("insertOrderedList")],[Quote,"Kutipan",() => command("formatBlock","BLOCKQUOTE")],[Code2,"Kode",() => command("formatBlock","PRE")],
    [LinkIcon,"Tautan",promptLink],[ImageIcon,"Gambar",promptImage],[Table2,"Tabel",insertTable],[AlignLeft,"Rata kiri",() => command("justifyLeft")],[AlignCenter,"Rata tengah",() => command("justifyCenter")],[AlignRight,"Rata kanan",() => command("justifyRight")],
    [Minus,"Garis",() => command("insertHorizontalRule")],[Undo2,"Urungkan",() => command("undo")],[Redo2,"Ulangi",() => command("redo")],[RemoveFormatting,"Bersihkan format",() => command("removeFormat")]
  ] as const;

  return (
    <div className={cn("space-y-2", className, fullscreen && "fixed inset-3 z-[70] flex flex-col rounded-2xl bg-white p-3 shadow-2xl")}>
      {label && <div><label className="block text-sm font-semibold text-dark">{label}</label>{helpText && <p className="mt-1 text-xs text-dark-500">{helpText}</p>}</div>}
      <div className="overflow-hidden rounded-2xl border border-dark-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-1 border-b border-dark-100 bg-dark-50 p-2" role="toolbar" aria-label="Format konten">
          {toolbar.map(([Icon,itemLabel,action]) => <button key={itemLabel} type="button" title={itemLabel} aria-label={itemLabel} onMouseDown={(e)=>e.preventDefault()} onClick={action}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-dark-600 hover:bg-white hover:text-dark focus:outline-none focus:ring-2 focus:ring-primary/30"><Icon className="h-4 w-4" /></button>)}
          <span className="mx-1 h-6 w-px bg-dark-200" aria-hidden="true"/>
          <button type="button" onClick={()=>setSourceMode(v=>!v)} className={cn("inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold",sourceMode?"bg-dark text-white":"text-dark-600 hover:bg-white")} aria-pressed={sourceMode}>
            {sourceMode ? <Eye className="h-4 w-4"/> : <Code className="h-4 w-4"/>} {sourceMode ? "Preview" : "HTML"}
          </button>
          <button type="button" onClick={()=>setFullscreen(v=>!v)} className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-dark-600 hover:bg-white" aria-label={fullscreen?"Keluar fullscreen":"Fullscreen"}>{fullscreen?<Minimize2 className="h-4 w-4"/>:<Maximize2 className="h-4 w-4"/>}</button>
        </div>
        {sourceMode ? <textarea value={value} onChange={(e)=>onChange(e.target.value)} className="block w-full resize-none border-0 bg-[#0f172a] p-4 font-mono text-xs leading-6 text-slate-100 outline-none" style={{minHeight}} aria-label="HTML sumber" spellCheck={false}/>
        : <div ref={editorRef} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" data-placeholder={placeholder} onInput={commit} onBlur={commit}
            className="rich-editor-content max-w-none overflow-auto p-5 text-sm leading-7 text-dark outline-none" style={{minHeight}}/>}
      </div>
    </div>
  );
}
