"use client";

import * as React from "react";
import { Check, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  productId: string;
  canReview: boolean;
  isLoggedIn: boolean;
  alreadyReviewed: boolean;
};

export function ProductReviewForm({ productId, canReview, isLoggedIn, alreadyReviewed }: Props) {
  const [rating, setRating] = React.useState(5);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  if (!isLoggedIn) {
    return (
      <div className="mt-6 rounded-2xl border border-dark-100 bg-dark-50 p-5">
        <p className="font-semibold text-dark">Punya pengalaman dengan produk ini?</p>
        <p className="mt-1 text-sm text-dark-500">Login untuk menulis ulasan setelah pesanan Anda selesai.</p>
      </div>
    );
  }

  if (alreadyReviewed || submitted) {
    return (
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-800">
        <Check className="mt-0.5 h-5 w-5 shrink-0" />
        <div><p className="font-semibold">Ulasan sudah dikirim</p><p className="mt-1 text-sm">Ulasan Anda sedang menunggu/ sudah melewati moderasi.</p></div>
      </div>
    );
  }

  if (!canReview) {
    return (
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="font-semibold text-dark">Ulasan terverifikasi</p>
        <p className="mt-1 text-sm text-dark-600">Form aktif setelah Anda membeli produk ini dan pesanan berstatus selesai.</p>
      </div>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error?.message || "Gagal mengirim ulasan.");
        return;
      }
      setMessage(data.message || "Ulasan terkirim.");
      setComment("");
      setSubmitted(true);
    } catch {
      setError("Koneksi gagal. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mt-6 overflow-hidden border-primary/15 bg-gradient-to-br from-primary-50 to-white">
      <CardContent className="p-6">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-dark">Bagikan pengalaman Anda</h3>
          <p className="mt-1 text-sm text-dark-500">Ulasan Anda akan masuk moderasi sebelum tampil publik.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <span className="mb-2 block text-sm font-medium text-dark">Rating</span>
            <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
              {Array.from({ length: 5 }).map((_, index) => {
                const value = index + 1;
                const active = value <= (hoverRating || rating);
                return (
                  <button
                    type="button"
                    key={value}
                    aria-label={`Beri ${value} bintang`}
                    onMouseEnter={() => setHoverRating(value)}
                    onClick={() => setRating(value)}
                    className="rounded-lg p-1 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Star className={`h-7 w-7 ${active ? "fill-yellow-400 text-yellow-500" : "text-dark-200"}`} />
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label htmlFor="review-comment" className="mb-2 block text-sm font-medium text-dark">Komentar</label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={2000}
              rows={4}
              required
              placeholder="Ceritakan kualitas produk, hasil cetak, pelayanan, atau pengalaman Anda…"
              className="w-full resize-y rounded-xl border border-dark-200 bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <p className="mt-1 text-right text-xs text-dark-400">{comment.length}/2000</p>
          </div>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {message && <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}
          <Button type="submit" disabled={saving || !comment.trim()} isLoading={saving}>
            {saving ? "Mengirim…" : "Kirim ulasan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
