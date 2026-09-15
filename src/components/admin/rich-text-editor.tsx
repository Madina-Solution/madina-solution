"use client";

import * as React from "react";
import { sanitizeArticleHtml } from "@/lib/security/sanitize-html";
import {
  AlignCenter, AlignLeft, AlignRight, Bold, Code2, ImagePlus,
  Italic, Link2, List, ListOrdered, Maximize2, Minus, Redo2,
  Strikethrough, Underline, Undo2, Unlink, X
} from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  minHeight?: number;
};

type ToolButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: React.ReactNode;
  onBeforeCommand?: () => void;
};

function ToolButton({ label, children, onBeforeCommand, ...props }: ToolButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      {...props}
      onMouseDown={(event) => {
        props.onMouseDown?.(event);
        if (!event.defaultPrevented) event.preventDefault();
        onBeforeCommand?.();
      }}
      className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-transparent px-2 text-dark-600 transition hover:border-dark-200 hover:bg-dark-50 hover:text-dark focus-visible:ring-2 focus-visible:ring-primary"
    >
      {children}
    </button>
  );
}

function cleanEditorHtml(html: string): string {
  return html
    .replace(/<div><br><\/div>/gi, "<p><br /></p>")
    .replace(/<div>/gi, "<p>")
    .replace(/<\/div>/gi, "</p>");
}

export function RichTextEditor({ value, onChange, minHeight = 420 }: Props) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [sourceMode, setSourceMode] = React.useState(false);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [heading, setHeading] = React.useState("p");
  const [linkOpen, setLinkOpen] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState("");
  const [linkText, setLinkText] = React.useState("");
  const [imageOpen, setImageOpen] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState("");
  const savedSelection = React.useRef<Range | null>(null);

  const saveSelection = React.useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return;
    const range = selection.getRangeAt(0);
    if (editorRef.current.contains(range.commonAncestorContainer)) {
      savedSelection.current = range.cloneRange();
    }
  }, []);

  const restoreSelection = React.useCallback(() => {
    const selection = window.getSelection();
    const range = savedSelection.current;
    if (!selection || !range) return;
    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

  React.useEffect(() => {
    if (!sourceMode && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [sourceMode, value]);

  const emit = React.useCallback(() => {
    onChange(cleanEditorHtml(editorRef.current?.innerHTML || ""));
  }, [onChange]);

  const focusEditor = () => editorRef.current?.focus();

  const exec = (command: string, commandValue?: string) => {
    focusEditor();
    restoreSelection();
    document.execCommand(command, false, commandValue);
    emit();
  };

  const insertLink = () => {
    focusEditor();
    restoreSelection();
    const url = linkUrl.trim();
    if (!url) return;
    const safeUrl = /^(https?:\/\/|mailto:|tel:|\/)/i.test(url) ? url : `https://${url}`;
    if (linkText.trim()) {
      document.execCommand("insertHTML", false, `<a href="${safeUrl.replace(/"/g, "&quot;")}" target="_blank" rel="noopener noreferrer nofollow">${linkText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</a>`);
    } else {
      document.execCommand("createLink", false, safeUrl);
    }
    emit();
    setLinkOpen(false);
    setLinkUrl("");
    setLinkText("");
  };

  const insertImage = () => {
    const url = imageUrl.trim();
    if (!url || !/^(https?:\/\/|\/)/i.test(url)) return;
    focusEditor();
    restoreSelection();
    document.execCommand("insertHTML", false, `<img src="${url.replace(/"/g, "&quot;")}" alt="Gambar artikel" />`);
    emit();
    setImageOpen(false);
    setImageUrl("");
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const html = event.clipboardData.getData("text/html");
    if (html) {
      event.preventDefault();
      document.execCommand("insertHTML", false, sanitizeArticleHtml(html));
      emit();
      return;
    }
    const text = event.clipboardData.getData("text/plain");
    if (/<[a-z][\s\S]*>/i.test(text) && sourceMode) {
      event.preventDefault();
      document.execCommand("insertText", false, text);
      emit();
    }
  };

  const applyBlock = (tag: string) => {
    setHeading(tag);
    focusEditor();
    restoreSelection();
    document.execCommand("formatBlock", false, tag);
    emit();
  };

  const toggleSource = () => {
    const html = editorRef.current?.innerHTML || value;
    if (!sourceMode) {
      onChange(cleanEditorHtml(html));
    } else if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
    setSourceMode((v) => !v);
  };

  const toolbar = (
    <div className="flex flex-wrap items-center gap-1 border-b border-dark-100 bg-white p-2">
      <select
        value={heading}
        onMouseDown={() => saveSelection()}
        onChange={(e) => applyBlock(e.target.value)}
        aria-label="Format blok"
        className="h-9 rounded-lg border border-dark-200 bg-white px-2 text-sm text-dark outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
      >
        <option value="p">Paragraf</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="h4">Heading 4</option>
        <option value="blockquote">Kutipan</option>
        <option value="pre">Kode blok</option>
      </select>
      <span className="mx-1 h-6 w-px bg-dark-100" />
      <ToolButton label="Tebal" onBeforeCommand={saveSelection} onClick={() => exec("bold")}><Bold className="h-4 w-4" /></ToolButton>
      <ToolButton label="Miring" onBeforeCommand={saveSelection} onClick={() => exec("italic")}><Italic className="h-4 w-4" /></ToolButton>
      <ToolButton label="Garis bawah" onBeforeCommand={saveSelection} onClick={() => exec("underline")}><Underline className="h-4 w-4" /></ToolButton>
      <ToolButton label="Coret" onBeforeCommand={saveSelection} onClick={() => exec("strikeThrough")}><Strikethrough className="h-4 w-4" /></ToolButton>
      <span className="mx-1 h-6 w-px bg-dark-100" />
      <ToolButton label="Daftar bullet" onBeforeCommand={saveSelection} onClick={() => exec("insertUnorderedList")}><List className="h-4 w-4" /></ToolButton>
      <ToolButton label="Daftar bernomor" onBeforeCommand={saveSelection} onClick={() => exec("insertOrderedList")}><ListOrdered className="h-4 w-4" /></ToolButton>
      <ToolButton label="Rata kiri" onBeforeCommand={saveSelection} onClick={() => exec("justifyLeft")}><AlignLeft className="h-4 w-4" /></ToolButton>
      <ToolButton label="Rata tengah" onBeforeCommand={saveSelection} onClick={() => exec("justifyCenter")}><AlignCenter className="h-4 w-4" /></ToolButton>
      <ToolButton label="Rata kanan" onBeforeCommand={saveSelection} onClick={() => exec("justifyRight")}><AlignRight className="h-4 w-4" /></ToolButton>
      <span className="mx-1 h-6 w-px bg-dark-100" />
      <ToolButton label="Sisipkan tautan" onBeforeCommand={saveSelection} onClick={() => setLinkOpen((v) => !v)}><Link2 className="h-4 w-4" /></ToolButton>
      <ToolButton label="Hapus tautan" onBeforeCommand={saveSelection} onClick={() => exec("unlink")}><Unlink className="h-4 w-4" /></ToolButton>
      <ToolButton label="Sisipkan gambar dari URL" onBeforeCommand={saveSelection} onClick={() => setImageOpen((v) => !v)}><ImagePlus className="h-4 w-4" /></ToolButton>
      <ToolButton label="Garis pemisah" onBeforeCommand={saveSelection} onClick={() => exec("insertHorizontalRule")}><Minus className="h-4 w-4" /></ToolButton>
      <ToolButton label="Undo" onBeforeCommand={saveSelection} onClick={() => exec("undo")}><Undo2 className="h-4 w-4" /></ToolButton>
      <ToolButton label="Redo" onBeforeCommand={saveSelection} onClick={() => exec("redo")}><Redo2 className="h-4 w-4" /></ToolButton>
      <span className="ml-auto flex items-center gap-1">
        <ToolButton label={fullscreen ? "Keluar layar penuh" : "Layar penuh"} onClick={() => setFullscreen((v) => !v)}><Maximize2 className="h-4 w-4" /></ToolButton>
        <ToolButton label="Lihat / edit HTML" onClick={toggleSource}><Code2 className="h-4 w-4" /></ToolButton>
      </span>
    </div>
  );

  const editor = sourceMode ? (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
      aria-label="HTML artikel"
      className="w-full resize-y border-0 bg-[#101114] px-4 py-4 font-mono text-sm leading-6 text-white outline-none"
      style={{ minHeight }}
    />
  ) : (
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      role="textbox"
      aria-multiline="true"
      onInput={emit}
      onPaste={handlePaste}
      className="prose prose-sm max-w-none overflow-y-auto px-5 py-4 text-dark-700 outline-none focus:bg-white [&_h2]:mt-5 [&_h2]:text-2xl [&_h3]:mt-4 [&_h3]:text-xl [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:bg-primary-50 [&_blockquote]:px-4 [&_blockquote]:py-2 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-dark-900 [&_pre]:p-4 [&_pre]:text-white [&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-xl"
      style={{ minHeight }}
    />
  );

  return (
    <>
      <div className={`${fullscreen ? "fixed inset-4 z-50 flex flex-col shadow-2xl" : "relative"} overflow-hidden rounded-2xl border border-dark-200 bg-white`}>
        {toolbar}
        {linkOpen && (
          <div className="border-b border-dark-100 bg-dark-50 p-3">
            <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
              <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://contoh.com atau /halaman" className="rounded-lg border border-dark-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary" aria-label="URL tautan" />
              <input value={linkText} onChange={(e) => setLinkText(e.target.value)} placeholder="Teks tautan (opsional)" className="rounded-lg border border-dark-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary" aria-label="Teks tautan" />
              <div className="flex gap-1">
                <button type="button" onClick={insertLink} className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white">Sisipkan</button>
                <button type="button" onClick={() => setLinkOpen(false)} className="rounded-lg border border-dark-200 px-3 py-2 text-sm">Tutup</button>
              </div>
            </div>
          </div>
        )}
        {imageOpen && (
          <div className="border-b border-dark-100 bg-dark-50 p-3">
            <div className="flex gap-2">
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL gambar (https://... atau /media/...)" className="min-w-0 flex-1 rounded-lg border border-dark-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary" aria-label="URL gambar" />
              <button type="button" onClick={insertImage} className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white">Sisipkan</button>
              <button type="button" onClick={() => setImageOpen(false)} className="rounded-lg border border-dark-200 px-3 py-2 text-sm"><X className="h-4 w-4" /></button>
            </div>
          </div>
        )}
        {sourceMode && <div className="border-b border-dark-100 bg-dark-900 px-4 py-2 text-xs text-white/80">Mode HTML aktif — Anda dapat menempelkan HTML lengkap, shortcode sederhana, atau kode blok. HTML tetap akan disanitasi saat disimpan.</div>}
        {editor}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-dark-100 bg-dark-50 px-4 py-2 text-xs text-dark-400">
          <span>{sourceMode ? "HTML / source editor" : "Visual editor"}</span>
          <span>Paste dari Word/Google Docs tetap diformat • HTML & script berbahaya akan difilter di server</span>
        </div>
      </div>
      {fullscreen && <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setFullscreen(false)} />}
    </>
  );
}
