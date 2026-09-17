"use client";

import * as React from "react";
import { ChevronDown, ListTree } from "lucide-react";

type Heading = { id: string; level: number; title: string };
export function ArticleToc({ headings }: { headings: Heading[] }) {
  const [open, setOpen] = React.useState(true);
  if (!headings.length) return null;
  return <nav aria-label="Daftar isi artikel" className="rounded-2xl border border-dark-100 bg-white p-4 shadow-sm lg:sticky lg:top-24"><button type="button" className="flex w-full items-center justify-between gap-3 text-left" aria-expanded={open} onClick={() => setOpen((value) => !value)}><span className="flex items-center gap-2 text-sm font-bold text-dark"><ListTree className="h-4 w-4 text-primary" aria-hidden="true" />Daftar isi</span><ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" /></button>{open && <ol className="mt-4 space-y-2 border-l border-dark-100 pl-3">{headings.map((h) => <li key={h.id} className={h.level === 3 ? "pl-3" : ""}><a href={`#${h.id}`} className="text-sm leading-5 text-dark-600 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">{h.title}</a></li>)}</ol>}</nav>;
}
