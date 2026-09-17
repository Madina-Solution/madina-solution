"use client";

import * as React from "react";
import { Check, Copy, Facebook, Linkedin, Mail, Share2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ArticleReadingTools({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = React.useState(false);
  const [shared, setShared] = React.useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const nativeShare = async () => {
    if (!navigator.share) return copyLink();
    try {
      await navigator.share({ title, text: title, url });
      setShared(true);
      window.setTimeout(() => setShared(false), 1500);
    } catch {}
  };

  const popup = (target: string) => {
    window.open(target, "share", "width=640,height=620,noopener,noreferrer");
  };

  return (
    <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-dark-200 bg-white/95 p-1.5 shadow-[0_16px_50px_rgba(15,23,42,.16)] backdrop-blur lg:bottom-auto lg:left-auto lg:right-5 lg:top-1/2 lg:translate-x-0 lg:-translate-y-1/2 lg:flex-col" aria-label="Bagikan artikel">
      <button type="button" aria-label="Bagikan artikel" title="Bagikan" onClick={nativeShare} className="grid h-10 w-10 place-items-center rounded-xl text-dark-600 hover:bg-dark-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Share2 className="h-4 w-4" aria-hidden="true" /></button>
      <button type="button" aria-label="Bagikan ke X" title="X" onClick={() => popup(`https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`)} className="grid h-10 w-10 place-items-center rounded-xl text-dark-600 hover:bg-dark-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><X className="h-4 w-4" aria-hidden="true" /></button>
      <button type="button" aria-label="Bagikan ke Facebook" title="Facebook" onClick={() => popup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)} className="grid h-10 w-10 place-items-center rounded-xl text-dark-600 hover:bg-dark-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Facebook className="h-4 w-4" aria-hidden="true" /></button>
      <button type="button" aria-label="Bagikan ke LinkedIn" title="LinkedIn" onClick={() => popup(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`)} className="grid h-10 w-10 place-items-center rounded-xl text-dark-600 hover:bg-dark-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Linkedin className="h-4 w-4" aria-hidden="true" /></button>
      <a href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`} aria-label="Bagikan melalui email" title="Email" className="grid h-10 w-10 place-items-center rounded-xl text-dark-600 hover:bg-dark-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Mail className="h-4 w-4" aria-hidden="true" /></a>
      <button type="button" aria-label={copied ? "Link sudah disalin" : "Salin link artikel"} title={copied ? "Tersalin" : "Salin link"} onClick={copyLink} className={cn("grid h-10 w-10 place-items-center rounded-xl text-dark-600 hover:bg-dark-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", copied && "bg-emerald-50 text-emerald-700")}>{copied || shared ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}</button>
    </div>
  );
}
