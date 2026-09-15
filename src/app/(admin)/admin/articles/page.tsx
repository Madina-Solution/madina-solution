"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Loader2, FileText, Search, Eye, EyeOff, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MediaUploader } from "@/components/ui/media-uploader";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { articleContentToHtml } from "@/lib/security/sanitize-html";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  thumbnail: string | null;
  category: string | null;
  tags: string[] | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[] | null;
  focusKeyword: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  isPublished: boolean | null;
  publishedAt: string | null;
  createdAt: string;
};

type ArticleForm = {
  thumbnail: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  focusKeyword: string;
  canonicalUrl: string;
  noIndex: boolean;
  isPublished: boolean;
};

const EMPTY_FORM: ArticleForm = {
  thumbnail: "", title: "", slug: "", excerpt: "", content: "", category: "", tags: "",
  seoTitle: "", seoDescription: "", seoKeywords: "", focusKeyword: "", canonicalUrl: "",
  noIndex: false, isPublished: false,
};

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim().toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toTags(value: string): string[] {
  return value.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 20);
}

export default function AdminArticlesPage() {
  const { toast } = useToast();
  const [items, setItems] = React.useState<Article[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [form, setForm] = React.useState<ArticleForm>(EMPTY_FORM);

  const fetchData = React.useCallback(async () => {
    try {
      const r = await fetch("/api/admin/articles", { cache: "no-store" });
      const d = await r.json();
      if (d.success) setItems(d.articles);
    } catch {
      toast({ type: "error", title: "Gagal memuat artikel" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    // Schedule the initial async load after the effect commits. This keeps the
    // effect from triggering a synchronous cascading render under the React
    // hooks lint rules while preserving the existing cancellation-free fetch.
    const timer = window.setTimeout(() => {
      void fetchData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchData]);

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast({ type: "error", title: "Judul dan slug wajib diisi" });
      return;
    }
    if (form.seoDescription.length > 160) {
      toast({ type: "error", title: "Deskripsi SEO maksimal 160 karakter" });
      return;
    }
    setIsSaving(true);
    try {
      const url = editId ? `/api/admin/articles/${editId}` : "/api/admin/articles";
      const resBody = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content,
        category: form.category.trim(),
        thumbnail: form.thumbnail || "",
        tags: toTags(form.tags),
        seoTitle: form.seoTitle.trim() || undefined,
        seoDescription: form.seoDescription.trim() || undefined,
        seoKeywords: toTags(form.seoKeywords),
        focusKeyword: form.focusKeyword.trim() || undefined,
        canonicalUrl: form.canonicalUrl.trim() || "",
        noIndex: form.noIndex,
        isPublished: form.isPublished,
      };
      const res = await fetch(url, {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resBody),
      });
      const data = await res.json();
      if (data.success) {
        toast({ type: "success", title: editId ? "Artikel diperbarui" : "Artikel dibuat" });
        resetForm();
        await fetchData();
      } else {
        toast({ type: "error", title: data.error?.message || "Gagal menyimpan artikel" });
      }
    } catch {
      toast({ type: "error", title: "Terjadi kesalahan saat menyimpan artikel" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/articles/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast({ type: "success", title: "Artikel dihapus" });
        await fetchData();
      } else {
        toast({ type: "error", title: data.error?.message || "Gagal menghapus artikel" });
      }
    } catch {
      toast({ type: "error", title: "Gagal menghapus artikel" });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const togglePublish = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/articles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !current }),
    });
    const data = await res.json();
    if (data.success) {
      toast({ type: "success", title: current ? "Artikel di-unpublish" : "Artikel dipublish" });
      await fetchData();
    } else {
      toast({ type: "error", title: data.error?.message || "Gagal mengubah status" });
    }
  };

  const startEdit = (a: Article) => {
    setForm({
      thumbnail: a.thumbnail || "",
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt || "",
      content: articleContentToHtml(a.content || ""),
      category: a.category || "",
      tags: (a.tags || []).join(", "),
      seoTitle: a.seoTitle || "",
      seoDescription: a.seoDescription || "",
      seoKeywords: (a.seoKeywords || []).join(", "),
      focusKeyword: a.focusKeyword || "",
      canonicalUrl: a.canonicalUrl || "",
      noIndex: Boolean(a.noIndex),
      isPublished: Boolean(a.isPublished),
    });
    setEditId(a.id);
    setShowForm(true);
  };

  const filtered = items.filter((a) => {
    const q = query.trim().toLowerCase();
    return !q || `${a.title} ${a.category || ""} ${a.slug}`.toLowerCase().includes(q);
  });

  const update = <K extends keyof ArticleForm>(key: K, value: ArticleForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Artikel & SEO</h1>
          <p className="mt-1 text-dark-500">{items.length} artikel • editor visual + HTML source</p>
        </div>
        <Button onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" />Tambah Artikel
        </Button>
      </div>

      {showForm && (
        <Card className="overflow-hidden border-dark-100 shadow-premium">
          <CardContent className="p-5 sm:p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-dark">{editId ? "Edit Artikel" : "Tulis Artikel Baru"}</h2>
                <p className="mt-1 text-sm text-dark-500">Kelola naskah, media, permalink, dan SEO dalam satu editor.</p>
              </div>
              <button type="button" onClick={resetForm} className="rounded-lg p-2 text-dark-400 hover:bg-dark-50" aria-label="Tutup editor"><XIcon /></button>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
              <div className="min-w-0 space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark">Judul *</label>
                  <Input
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    onBlur={() => !editId && !form.slug && update("slug", slugify(form.title))}
                    placeholder="Judul artikel yang kuat dan jelas"
                    className="h-11 text-base"
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <label className="block text-sm font-medium text-dark">Konten artikel</label>
                    <span className="text-xs text-dark-400">HTML source tersedia di toolbar</span>
                  </div>
                  <RichTextEditor value={form.content} onChange={(value) => update("content", value)} />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark">Ringkasan / excerpt</label>
                  <textarea value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} rows={3} maxLength={300} placeholder="Ringkasan yang tampil di kartu blog dan dapat menjadi fallback meta description." className="w-full rounded-xl border border-dark-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-dark-100 bg-dark-50/70 p-4">
                  <h3 className="font-semibold text-dark">Publikasi</h3>
                  <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-dark-600">
                    <input type="checkbox" checked={form.isPublished} onChange={(e) => update("isPublished", e.target.checked)} className="h-4 w-4 rounded border-dark-300 text-primary" />
                    Terbitkan artikel
                  </label>
                  <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-dark-600">
                    <input type="checkbox" checked={form.noIndex} onChange={(e) => update("noIndex", e.target.checked)} className="h-4 w-4 rounded border-dark-300 text-primary" />
                    Noindex (jangan diindeks mesin pencari)
                  </label>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark">Featured Image</label>
                  <MediaUploader value={form.thumbnail} onChange={(value) => update("thumbnail", Array.isArray(value) ? value[0] || "" : value)} purpose="article_image" label="Upload gambar artikel" persist={editId ? { endpoint: `/api/admin/articles/${editId}`, key: "thumbnail", mode: "replace", method: "PATCH" } : undefined} />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark">Permalink / Slug *</label>
                  <Input value={form.slug} onChange={(e) => update("slug", slugify(e.target.value))} placeholder="contoh-cara-membuat-branding" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark">Kategori</label>
                  <Input value={form.category} onChange={(e) => update("category", e.target.value)} placeholder="Tips, Tutorial, Branding…" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark">Label / Tag</label>
                  <Input value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="branding, desain, percetakan" />
                </div>

                <div className="rounded-2xl border border-primary/15 bg-primary-50/50 p-4">
                  <div className="flex items-center justify-between">
                    <div><h3 className="font-semibold text-dark">SEO artikel</h3><p className="mt-1 text-xs text-dark-500">Pengaturan ala Blogger: search description, keyword, canonical, dan robots.</p></div>
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-dark-500">SEO Title</label>
                      <Input value={form.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} maxLength={255} placeholder={form.title || "Judul SEO"} />
                    </div>
                    <div>
                      <div className="mb-1.5 flex items-center justify-between"><label className="block text-xs font-semibold uppercase tracking-wide text-dark-500">Meta Description</label><span className={`text-xs ${form.seoDescription.length > 160 ? "text-red-600" : "text-dark-400"}`}>{form.seoDescription.length}/160</span></div>
                      <textarea value={form.seoDescription} onChange={(e) => update("seoDescription", e.target.value)} rows={3} maxLength={160} placeholder="Deskripsi yang menarik untuk hasil pencarian Google…" className="w-full rounded-xl border border-dark-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-dark-500">Focus Keyword</label>
                      <Input value={form.focusKeyword} onChange={(e) => update("focusKeyword", e.target.value)} maxLength={120} placeholder="mis. jasa desain logo" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-dark-500">SEO Keywords</label>
                      <Input value={form.seoKeywords} onChange={(e) => update("seoKeywords", e.target.value)} placeholder="logo, branding, desain logo" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-dark-500">Canonical URL</label>
                      <Input value={form.canonicalUrl} onChange={(e) => update("canonicalUrl", e.target.value)} placeholder="Kosongkan untuk canonical otomatis" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-dark-100 pt-5">
              <Button onClick={handleSave} isLoading={isSaving}>{editId ? "Simpan Perubahan" : "Simpan Artikel"}</Button>
              {editId && form.slug && <Button variant="outline" asChild><Link href={`/blog/${encodeURIComponent(form.slug)}`} target="_blank"><ExternalLink className="mr-2 h-4 w-4" />Preview</Link></Button>}
              <Button variant="outline" onClick={resetForm}>Batal</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="rounded-2xl border border-dark-100 bg-white shadow-premium">
        <div className="flex flex-col gap-3 border-b border-dark-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-medium text-dark">Daftar artikel</div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari judul, kategori, slug…" className="pl-9" />
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-dark-400" /></div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-dark-100 text-left">
                <th className="px-5 py-3 font-medium text-dark-500">Artikel</th><th className="px-5 py-3 font-medium text-dark-500">Status</th><th className="px-5 py-3 font-medium text-dark-500">Tanggal</th><th className="px-5 py-3 font-medium text-dark-500">Aksi</th>
              </tr></thead>
              <tbody>{filtered.map((a) => (
                <tr key={a.id} className="border-b border-dark-50 last:border-0 hover:bg-dark-50/50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-dark">{a.title}</p>
                    <p className="mt-1 text-xs text-dark-400">{a.category || "Tanpa kategori"} • /blog/{a.slug}</p>
                  </td>
                  <td className="px-5 py-4">
                    <button type="button" onClick={() => togglePublish(a.id, Boolean(a.isPublished))} className="flex items-center gap-2">
                      {a.isPublished ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-dark-400" />}
                      <Badge variant={a.isPublished ? "success" : "warning"}>{a.isPublished ? "Terbit" : "Draft"}</Badge>
                      {a.noIndex && <Badge variant="outline">noindex</Badge>}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-xs text-dark-500">{formatDate(a.publishedAt || a.createdAt)}</td>
                  <td className="px-5 py-4"><div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(a)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                    {a.isPublished && <Button variant="ghost" size="icon" asChild title="Buka artikel"><Link href={`/blog/${encodeURIComponent(a.slug)}`} target="_blank"><ExternalLink className="h-4 w-4" /></Link></Button>}
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ id: a.id, title: a.title })} title="Hapus"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center"><FileText className="h-10 w-10 text-dark-300" /><p className="mt-4 font-semibold text-dark">{query ? "Artikel tidak ditemukan" : "Belum ada artikel"}</p></div>
        )}
      </div>

      <ConfirmDialog open={!!deleteTarget} title={`Hapus "${deleteTarget?.title}"?`} description="Artikel akan dihapus permanen." confirmLabel="Hapus" variant="danger" isLoading={isDeleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

function XIcon() {
  return <span className="text-lg leading-none">×</span>;
}
