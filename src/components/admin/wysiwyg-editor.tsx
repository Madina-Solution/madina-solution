"use client";

import * as React from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Eye,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Table2,
  Underline,
  Undo2,
  Unlink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizeRichHtml } from "@/lib/sanitize-rich-html";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  label?: string;
  helpText?: string;
  className?: string;
};

type ToolbarAction = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  command?: string;
  value?: string;
};

const TOOLBAR_GROUPS: ToolbarAction[][] = [
  [
    { key: "bold", label: "Tebal", icon: Bold, command: "bold" },
    { key: "italic", label: "Miring", icon: Italic, command: "italic" },
    { key: "underline", label: "Garis bawah", icon: Underline, command: "underline" },
    { key: "strike", label: "Coret", icon: Strikethrough, command: "strikeThrough" },
  ],
  [
    { key: "h1", label: "Heading 1", icon: Heading1, command: "formatBlock", value: "H1" },
    { key: "h2", label: "Heading 2", icon: Heading2, command: "formatBlock", value: "H2" },
    { key: "h3", label: "Heading 3", icon: Heading3, command: "formatBlock", value: "H3" },
    { key: "quote", label: "Kutipan", icon: Quote, command: "formatBlock", value: "BLOCKQUOTE" },
  ],
  [
    { key: "ul", label: "Daftar", icon: List, command: "insertUnorderedList" },
    { key: "ol", label: "Daftar bernomor", icon: ListOrdered, command: "insertOrderedList" },
    { key: "left", label: "Rata kiri", icon: AlignLeft, command: "justifyLeft" },
    { key: "center", label: "Rata tengah", icon: AlignCenter, command: "justifyCenter" },
    { key: "right", label: "Rata kanan", icon: AlignRight, command: "justifyRight" },
  ],
  [
    { key: "link", label: "Tautan", icon: LinkIcon },
    { key: "unlink", label: "Lepas tautan", icon: Unlink, command: "unlink" },
    { key: "image", label: "Upload gambar", icon: ImageIcon },
    { key: "table", label: "Tabel 2×2", icon: Table2 },
    { key: "code", label: "Blok kode", icon: Code2, command: "formatBlock", value: "PRE" },
    { key: "hr", label: "Garis pemisah", icon: Minus, command: "insertHorizontalRule" },
  ],
  [
    { key: "undo", label: "Urungkan", icon: Undo2, command: "undo" },
    { key: "redo", label: "Ulangi", icon: Redo2, command: "redo" },
    { key: "clear", label: "Bersihkan format", icon: RemoveFormatting, command: "removeFormat" },
  ],
];

function selectionInside(root: HTMLElement) {
  const selection = window.getSelection();
  return Boolean(selection && selection.rangeCount && selection.anchorNode && root.contains(selection.anchorNode));
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Tulis konten…",
  minHeight = 320,
  label,
  helpText,
  className,
}: Props) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const savedRangeRef = React.useRef<Range | null>(null);
  const [sourceMode, setSourceMode] = React.useState(false);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [wordCount, setWordCount] = React.useState(0);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  const saveSelection = React.useCallback(() => {
    if (!editorRef.current || !selectionInside(editorRef.current)) return;
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    savedRangeRef.current = selection.getRangeAt(0).cloneRange();
  }, []);

  const restoreSelection = React.useCallback(() => {
    const range = savedRangeRef.current;
    if (!range) return;
    const selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

  const updateStats = React.useCallback(() => {
    const text = editorRef.current?.innerText.replace(/\s+/g, " ").trim() || "";
    setWordCount(text ? text.split(" ").length : 0);
  }, []);

  const commit = React.useCallback(() => {
    if (!editorRef.current) return;
    const safe = sanitizeRichHtml(editorRef.current.innerHTML);
    if (safe !== editorRef.current.innerHTML) editorRef.current.innerHTML = safe;
    onChange(safe);
    updateStats();
  }, [onChange, updateStats]);

  React.useEffect(() => {
    if (sourceMode || !editorRef.current) return;
    if (editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value || "";
    updateStats();
  }, [sourceMode, updateStats, value]);

  const execute = React.useCallback(
    (command: string, commandValue?: string) => {
      editorRef.current?.focus();
      restoreSelection();
      try {
        document.execCommand(command, false, commandValue);
      } catch {
        return;
      }
      commit();
      saveSelection();
    },
    [commit, restoreSelection, saveSelection],
  );

  const promptLink = React.useCallback(() => {
    saveSelection();
    const url = window.prompt("URL tautan", "https://");
    if (!url) return;
    execute("createLink", url.trim());
  }, [execute, saveSelection]);

  const insertImageFromUpload = React.useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 15 * 1024 * 1024) return;
    setUploadingImage(true);
    saveSelection();
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("purpose", "content_image");
      body.append("visibility", "public");
      const response = await fetch("/api/media/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok || !data.success || !data.media?.url) throw new Error(data.error?.message || "Upload gambar gagal");
      const alt = window.prompt("Alt text gambar", label || "Gambar konten") || "Gambar konten";
      execute("insertHTML", `<figure class="rich-media"><img src="${escapeHtml(data.media.url)}" alt="${escapeHtml(alt.trim())}" loading="lazy"><figcaption>${escapeHtml(alt.trim())}</figcaption></figure><p><br></p>`);
    } catch {
      // Keep editor usable even when the upload service is unavailable.
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }, [execute, label, saveSelection]);

  const promptImage = React.useCallback(() => {
    saveSelection();
    const url = window.prompt("URL gambar publik", "https://");
    if (!url) return;
    const alt = window.prompt("Alt text gambar", label || "Gambar konten") || "Gambar konten";
    execute("insertHTML", `<figure class="rich-media"><img src="${escapeHtml(url.trim())}" alt="${escapeHtml(alt.trim())}" loading="lazy"><figcaption>${escapeHtml(alt.trim())}</figcaption></figure><p><br></p>`);
  }, [execute, label, saveSelection]);

  const insertTable = React.useCallback(() => {
    saveSelection();
    execute(
      "insertHTML",
      '<div class="rich-table-wrap"><table class="rich-table"><thead><tr><th>Kolom 1</th><th>Kolom 2</th></tr></thead><tbody><tr><td>Isi</td><td>Isi</td></tr><tr><td>Isi</td><td>Isi</td></tr></tbody></table></div><p><br></p>',
    );
  }, [execute, saveSelection]);

  const runToolbarAction = React.useCallback(
    (action: ToolbarAction) => {
      if (action.key === "link") return void promptLink();
      if (action.key === "image") return void promptImage();
      if (action.key === "table") return void insertTable();
      if (action.command) execute(action.command, action.value);
    },
    [execute, insertTable, promptImage, promptLink],
  );

  const onPaste = React.useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      event.preventDefault();
      const html = event.clipboardData.getData("text/html");
      const text = event.clipboardData.getData("text/plain");
      const payload = html ? sanitizeRichHtml(html) : escapeHtml(text).replace(/\n/g, "<br>");
      restoreSelection();
      editorRef.current?.focus();
      document.execCommand("insertHTML", false, payload);
      commit();
    },
    [commit, restoreSelection],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key.toLowerCase() === "b") {
        event.preventDefault(); execute("bold");
      } else if (mod && event.key.toLowerCase() === "i") {
        event.preventDefault(); execute("italic");
      } else if (mod && event.key.toLowerCase() === "u") {
        event.preventDefault(); execute("underline");
      } else if (mod && event.key.toLowerCase() === "k") {
        event.preventDefault(); void promptLink();
      }
    },
    [execute, promptLink],
  );

  return (
    <div className={cn("space-y-2", fullscreen && "fixed inset-3 z-[70] flex flex-col rounded-3xl bg-white p-3 shadow-2xl ring-1 ring-black/10", className)}>
      {label && (
        <div>
          <label className="block text-sm font-semibold text-dark">{label}</label>
          {helpText && <p className="mt-1 text-xs text-dark-500">{helpText}</p>}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-dark-200 bg-white shadow-[0_14px_50px_rgba(15,23,42,.08)]">
        <div className="sticky top-0 z-10 border-b border-dark-100 bg-white/95 p-2 backdrop-blur-xl" role="toolbar" aria-label={label ? `Format ${label}` : "Toolbar editor konten"}>
          <div className="flex flex-wrap items-center gap-1">
            {TOOLBAR_GROUPS.map((group, groupIndex) => (
              <React.Fragment key={groupIndex}>
                {groupIndex > 0 && <span className="mx-1 h-7 w-px bg-dark-100" aria-hidden="true" />}
                {group.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.key}
                      type="button"
                      title={action.label}
                      aria-label={action.label}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        saveSelection();
                      }}
                      onClick={() => {
                        if (action.key === "image") {
                          imageInputRef.current?.click();
                          return;
                        }
                        runToolbarAction(action);
                      }}
                      disabled={action.key === "image" && uploadingImage}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-dark-600 transition hover:bg-dark-50 hover:text-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-wait disabled:opacity-50"
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
            <span className="mx-1 h-7 w-px bg-dark-100" aria-hidden="true" />
            <button
              type="button"
              title={sourceMode ? "Kembali ke editor visual" : "Edit HTML sumber"}
              aria-label={sourceMode ? "Kembali ke editor visual" : "Edit HTML sumber"}
              aria-pressed={sourceMode}
              onClick={() => {
                if (!sourceMode) saveSelection();
                else onChange(sanitizeRichHtml(value));
                setSourceMode((open) => !open);
              }}
              className={cn("inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-primary", sourceMode ? "bg-dark text-white" : "text-dark-600 hover:bg-dark-50")}
            >
              {sourceMode ? <Eye className="h-4 w-4" aria-hidden="true" /> : <Code2 className="h-4 w-4" aria-hidden="true" />}
              {sourceMode ? "Visual" : "HTML"}
            </button>
            <button
              type="button"
              title={fullscreen ? "Keluar fullscreen" : "Fullscreen"}
              aria-label={fullscreen ? "Keluar fullscreen" : "Buka editor fullscreen"}
              aria-pressed={fullscreen}
              onClick={() => setFullscreen((open) => !open)}
              className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-xl text-dark-600 hover:bg-dark-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {fullscreen ? <Minimize2 className="h-4 w-4" aria-hidden="true" /> : <Maximize2 className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
        </div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void insertImageFromUpload(file);
          }}
          aria-label="Upload gambar ke editor"
        />

        {sourceMode ? (
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-label="HTML sumber"
            spellCheck={false}
            className="block w-full resize-none border-0 bg-[#0b1220] p-5 font-mono text-xs leading-6 text-slate-100 outline-none"
            style={{ minHeight }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label={label || "Editor konten"}
            data-placeholder={placeholder}
            onInput={commit}
            onBlur={() => {
              commit();
              saveSelection();
            }}
            onKeyDown={onKeyDown}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            onPaste={onPaste}
            className="rich-editor-content max-w-none overflow-auto px-6 py-5 text-sm leading-7 text-dark outline-none"
            style={{ minHeight }}
          />
        )}
        <div className="flex items-center justify-between border-t border-dark-100 bg-dark-50/50 px-4 py-2 text-[11px] text-dark-400">
          <span>⌘/Ctrl+B · I · U · K untuk shortcut</span>
          <span>{wordCount.toLocaleString("id-ID")} kata</span>
        </div>
      </div>
    </div>
  );
}
