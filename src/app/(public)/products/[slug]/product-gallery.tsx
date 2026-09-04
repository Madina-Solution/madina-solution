"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SiteImage } from "@/components/ui/site-image";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";

type Props = {
  thumbnail: string | null;
  gallery: string[];
  productName: string;
};

function isVideo(src: string) {
  return /\.(mp4|webm|mov)(?:[?#].*)?$/i.test(src) || src.includes("/video/upload/");
}

function normalizeMedia(thumbnail: string | null, gallery: string[]) {
  return Array.from(new Set([thumbnail, ...(gallery || [])].filter((value): value is string => Boolean(value && (/^https?:\/\//i.test(value) || value.startsWith("/"))))));
}

export function ProductGallery({ thumbnail, gallery, productName }: Props) {
  const media = normalizeMedia(thumbnail, gallery);
  const [index, setIndex] = React.useState(0);
  const [autoplay, setAutoplay] = React.useState(true);
  const [zoom, setZoom] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const touchStart = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!autoplay || hovered || media.length <= 1) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % media.length), 4500);
    return () => window.clearInterval(timer);
  }, [autoplay, hovered, media.length]);


  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") setIndex((current) => (current + 1) % Math.max(media.length, 1));
      if (event.key === "ArrowLeft") setIndex((current) => (current - 1 + Math.max(media.length, 1)) % Math.max(media.length, 1));
      if (event.key === "Escape") setZoom(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [media.length]);

  if (!media.length) {
    return (
      <div className="sticky top-24 flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-dark-100 bg-gradient-to-br from-dark-50 to-dark-100">
        <MediaPlaceholder label="Belum ada media produk" />
      </div>
    );
  }

  const safeIndex = Math.min(index, Math.max(media.length - 1, 0));
  const active = media[safeIndex];
  const activeIsVideo = isVideo(active);
  const next = () => setIndex((current) => (current + 1) % media.length);
  const prev = () => setIndex((current) => (current - 1 + media.length) % media.length);

  return (
    <>
      <div className="space-y-4 lg:sticky lg:top-24">
        <div
          className="relative aspect-square overflow-hidden rounded-3xl border border-dark-100 bg-dark-50 shadow-sm"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onTouchStart={(event) => { touchStart.current = event.changedTouches[0]?.clientX ?? null; }}
          onTouchEnd={(event) => {
            const start = touchStart.current;
            const end = event.changedTouches[0]?.clientX ?? start ?? 0;
            touchStart.current = null;
            if (start === null) return;
            const delta = end - start;
            if (Math.abs(delta) > 48) delta < 0 ? next() : prev();
          }}
        >
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative flex h-full w-full items-center justify-center"
          >
            {activeIsVideo ? (
              <video src={active} muted loop autoPlay playsInline controls preload="metadata" className="h-full w-full object-contain bg-black" aria-label={`${productName} video ${index + 1}`} />
            ) : (
              <SiteImage src={active} alt={`${productName} — media ${index + 1}`} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain" priority={index === 0} />
            )}
          </motion.div>

          {media.length > 1 && (
            <>
              <Button type="button" aria-label="Media sebelumnya" variant="secondary" size="icon" onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-black/10 bg-dark-950/90 text-white shadow-lg backdrop-blur transition hover:bg-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:left-4"><ChevronLeft /></Button>
              <Button type="button" aria-label="Media berikutnya" variant="secondary" size="icon" onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-black/10 bg-dark-950/90 text-white shadow-lg backdrop-blur transition hover:bg-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:right-4"><ChevronRight /></Button>
              <div className="absolute bottom-3 left-1/2 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/15 bg-dark-950/80 px-3 py-2 backdrop-blur sm:bottom-4">
                {media.map((_, dot) => <button type="button" key={dot} aria-label={`Tampilkan media ${dot + 1}`} aria-pressed={safeIndex === dot} onClick={() => setIndex(dot)} className={cn("h-1.5 rounded-full transition-all", safeIndex === dot ? "w-6 bg-white" : "w-1.5 bg-white/45")} />)}
              </div>
            </>
          )}

          <div className="absolute right-3 top-3 flex gap-2 sm:right-4 sm:top-4">
            {media.length > 1 && <Button type="button" variant="secondary" size="icon" aria-label={autoplay ? "Jeda slideshow" : "Putar slideshow"} onClick={() => setAutoplay((value) => !value)} className="rounded-full border border-black/10 bg-dark-950/90 text-white shadow-lg backdrop-blur transition hover:bg-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">{autoplay ? <Pause /> : <Play />}</Button>}
            <Button type="button" variant="secondary" size="icon" aria-label="Perbesar media" onClick={() => setZoom(true)} className="rounded-full border border-black/10 bg-dark-950/90 text-white shadow-lg backdrop-blur transition hover:bg-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"><Expand /></Button>
          </div>
        </div>

        {media.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" role="tablist" aria-label="Galeri produk">
            {media.map((src, i) => (
              <button key={`${src}-${i}`} type="button" role="tab" aria-selected={safeIndex === i} onClick={() => setIndex(i)} className={cn("relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border bg-dark-50", safeIndex === i ? "border-primary ring-2 ring-primary/20" : "border-dark-100 hover:border-dark-300")}>
                {isVideo(src) ? <><video src={src} muted playsInline preload="metadata" className="h-full w-full object-cover" /><span className="absolute inset-0 grid place-items-center bg-black/20"><span className="rounded-full bg-white/90 p-1.5"><Play className="h-3.5 w-3.5 fill-current" /></span></span></> : <SiteImage src={src} alt={`${productName} thumbnail ${i + 1}`} fill sizes="96px" className="object-cover" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {zoom && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label={`Preview ${productName}`} onClick={() => setZoom(false)}>
          <div className="relative h-[88vh] w-[94vw]" onClick={(event) => event.stopPropagation()}>
            {activeIsVideo ? <video src={active} controls autoPlay muted playsInline className="h-full w-full object-contain" /> : <SiteImage src={active} alt={`${productName} preview`} fill sizes="94vw" className="object-contain" />}
            <Button type="button" variant="secondary" size="icon" aria-label="Tutup preview" onClick={() => setZoom(false)} className="absolute right-2 top-2 rounded-full"><span className="text-xl leading-none">×</span></Button>
          </div>
        </div>
      )}
    </>
  );
}
