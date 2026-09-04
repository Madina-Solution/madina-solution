"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Loader2, FileText, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MediaUploader } from "@/components/ui/media-uploader";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

type Article = { id: string; title: string; slug: string; excerpt: string | null; content: string | null; thumbnail: string | null; category: string | null; isPublished: boolean | null; publishedAt: string | null; createdAt: string };

export default function AdminArticlesPage() {
  const { toast } = useToast();
  const [items, setItems] = React.useState<Article[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [form, setForm] = React.useState({ thumbnail: "", title: "", slug: "", excerpt: "", content: "", category: "", isPublished: false });

  const fetchData = React.useCallback(async () => {
    try { const r = await fetch("/api/admin/articles"); const d = await r.json(); if (d.success) setItems(d.articles); } catch {} finally { setIsLoading(false); }
  }, []);
  React.useEffect(() => {
    void (async () => { await fetchData(); })();
  }, [fetchData]);

  const resetForm = () => { setShowForm(false); setEditId(null); setForm({ thumbnail: "", title: "", slug: "", excerpt: "", content: "", category: "", isPublished: false }); };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) { toast({ type: "error", title: "Judul dan slug wajib diisi" }); return; }
    setIsSaving(true);
    try {
      const url = editId ? `/api/admin/articles/${editId}` : "/api/admin/articles";
      const res = await fetch(url, { method: editId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { toast({ type: "success", title: editId ? "Artikel diperbarui" : "Artikel dibuat" }); resetForm(); fetchData(); }
      else toast({ type: "error", title: data.error?.message || "Gagal" });
    } catch { toast({ type: "error", title: "Terjadi kesalahan" }); } finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return; setIsDeleting(true);
    try { const res = await fetch(`/api/admin/articles/${deleteTarget.id}`, { method: "DELETE" }); if ((await res.json()).success) { toast({ type: "success", title: "Artikel dihapus" }); fetchData(); } } catch {} finally { setIsDeleting(false); setDeleteTarget(null); }
  };

  const togglePublish = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/articles/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPublished: !current }) });
    if ((await res.json()).success) { toast({ type: "success", title: current ? "Artikel di-unpublish" : "Artikel dipublish" }); fetchData(); }
  };

  const startEdit = (a: Article) => { setForm({ thumbnail: a.thumbnail || "", title: a.title, slug: a.slug, excerpt: a.excerpt || "", content: "", category: a.category || "", isPublished: !!a.isPublished }); setEditId(a.id); setShowForm(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-dark">Artikel</h1><p className="mt-1 text-dark-500">{items.length} artikel</p></div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}><Plus className="mr-2 h-4 w-4" />Tambah Artikel</Button>
      </div>
      {showForm && (
        <Card><CardContent className="p-6">
          <h2 className="mb-4 font-semibold text-dark">{editId ? "Edit Artikel" : "Tambah Artikel"}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><MediaUploader value={form.thumbnail} onChange={(value) => setForm(p => ({ ...p, thumbnail: Array.isArray(value) ? value[0] || "" : value }))} purpose="article_image" label="Featured Image" persist={editId ? { endpoint: `/api/admin/articles/${editId}`, key: "thumbnail", mode: "replace", method: "PATCH" } : undefined} /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-dark">Judul *</label><Input value={form.title} onChange={(e) => { const t = e.target.value; setForm(p => ({ ...p, title: t, slug: editId ? p.slug : t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })); }} /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-dark">Slug *</label><Input value={form.slug} onChange={(e) => setForm(p => ({ ...p, slug: e.target.value }))} /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-dark">Kategori</label><Input value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))} placeholder="Tips, Tutorial, dll." /></div>
            <div className="flex items-center pt-6"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm(p => ({ ...p, isPublished: e.target.checked }))} className="h-4 w-4 rounded border-dark-300 text-primary" /><span className="text-sm text-dark-600">Publish langsung</span></label></div>
            <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-medium text-dark">Ringkasan</label><Input value={form.excerpt} onChange={(e) => setForm(p => ({ ...p, excerpt: e.target.value }))} placeholder="Ringkasan singkat artikel" /></div>
            <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-medium text-dark">Konten</label><textarea value={form.content} onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))} rows={6} className="w-full rounded-xl border border-dark-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Tulis konten artikel..." /></div>
          </div>
          <div className="mt-4 flex gap-2"><Button onClick={handleSave} isLoading={isSaving}>{editId ? "Simpan Perubahan" : "Simpan"}</Button><Button variant="outline" onClick={resetForm}>Batal</Button></div>
        </CardContent></Card>
      )}
      <div className="rounded-2xl border border-dark-100 bg-white">
        {isLoading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-dark-400" /></div>
        : items.length > 0 ? (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-dark-100 text-left">
            <th className="px-5 py-3 font-medium text-dark-500">Judul</th><th className="px-5 py-3 font-medium text-dark-500">Kategori</th><th className="px-5 py-3 font-medium text-dark-500">Status</th><th className="px-5 py-3 font-medium text-dark-500">Tanggal</th><th className="px-5 py-3 font-medium text-dark-500">Aksi</th>
          </tr></thead><tbody>{items.map((a) => (
            <tr key={a.id} className="border-b border-dark-50 last:border-0 hover:bg-dark-50/50">
              <td className="px-5 py-3.5"><p className="font-medium text-dark">{a.title}</p>{a.excerpt && <p className="text-xs text-dark-400 line-clamp-1">{a.excerpt}</p>}</td>
              <td className="px-5 py-3.5 text-dark-600">{a.category || "—"}</td>
              <td className="px-5 py-3.5"><button onClick={() => togglePublish(a.id, !!a.isPublished)}><Badge variant={a.isPublished ? "success" : "warning"}>{a.isPublished ? "Terbit" : "Draft"}</Badge></button></td>
              <td className="px-5 py-3.5 text-xs text-dark-500">{formatDate(a.createdAt)}</td>
              <td className="px-5 py-3.5"><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => startEdit(a)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ id: a.id, title: a.title })}><Trash2 className="h-4 w-4 text-red-500" /></Button></div></td>
            </tr>
          ))}</tbody></table></div>
        ) : <div className="flex flex-col items-center justify-center py-16"><FileText className="h-10 w-10 text-dark-300" /><p className="mt-4 font-semibold text-dark">Belum ada artikel</p></div>}
      </div>
      <ConfirmDialog open={!!deleteTarget} title={`Hapus "${deleteTarget?.title}"?`} description="Artikel akan dihapus permanen." confirmLabel="Hapus" variant="danger" isLoading={isDeleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
