"use client";

import * as React from "react";
import { ChevronDown, ListTree } from "lucide-react";

type Heading = { id: string; level: number; title: string };

export function ArticleToc({ headings }: { headings: Heading[] }) {
  const [open, setOpen] = React.useState(true);
  if (!headings.length) return null;
  return (
    <nav aria-label="Daftar isi artikel" className="rounded-3xl border border-dark-200 bg-white p-4 shadow-[0_16px_50px_rgba(15,23,42,.07)] lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-auto">
      <button type="button" className="flex w-full items-center justify-between gap-3 text-left" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span className="flex items-center gap-2 text-sm font-bold text-dark"><ListTree className="h-4 w-4 text-primary" aria-hidden="true" />Daftar isi</span>
        <ChevronDown className={`h-4 w-4 text-dark-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && <ol className="mt-4 space-y-1.5 border-l border-dark-100 pl-3">{headings.map((h) => <li key={h.id} className={h.level === 3 ? "pl-3" : ""}><a href={`#${h.id}`} className="block rounded-lg px-2 py-1.5 text-[13px] leading-5 text-dark-600 transition hover:bg-dark-50 hover:text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">{h.title}</a></li>)}</ol>}
    </nav>
  );
}
