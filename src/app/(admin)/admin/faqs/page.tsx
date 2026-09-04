"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Loader2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type FAQ = { id: string; question: string; answer: string; category: string | null; order: number | null; isActive: boolean };

export default function AdminFAQsPage() {
  const { toast } = useToast();
  const [faqs, setFaqs] = React.useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ question: "", answer: "", category: "", order: 0 });
  const [isSaving, setIsSaving] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/faqs");
      const data = await res.json();
      if (data.success) setFaqs(data.faqs);
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  }, []);

  React.useEffect(() => {
    void (async () => { await fetchData(); })();
  }, [fetchData]);

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) { toast({ type: "error", title: "Pertanyaan dan jawaban wajib diisi" }); return; }
    setIsSaving(true);
    try {
      const url = editId ? `/api/admin/faqs/${editId}` : "/api/admin/faqs";
      const res = await fetch(url, { method: editId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { toast({ type: "success", title: editId ? "FAQ diperbarui" : "FAQ dibuat" }); setShowForm(false); setEditId(null); setForm({ question: "", answer: "", category: "", order: 0 }); fetchData(); }
      else toast({ type: "error", title: data.error?.message || "Gagal" });
    } catch { toast({ type: "error", title: "Terjadi kesalahan" }); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/faqs/${deleteTarget}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { toast({ type: "success", title: "FAQ dihapus" }); fetchData(); }
      else toast({ type: "error", title: data.error?.message || "Gagal" });
    } catch { toast({ type: "error", title: "Terjadi kesalahan" }); }
    finally { setIsDeleting(false); setDeleteTarget(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-dark">FAQ</h1><p className="mt-1 text-dark-500">{faqs.length} pertanyaan</p></div>
        <Button onClick={() => { setShowForm(true); setEditId(null); setForm({ question: "", answer: "", category: "", order: 0 }); }}><Plus className="mr-2 h-4 w-4" />Tambah FAQ</Button>
      </div>

      {showForm && (
        <Card><CardContent className="p-6">
          <h2 className="mb-4 font-semibold text-dark">{editId ? "Edit FAQ" : "Tambah FAQ"}</h2>
          <div className="space-y-4">
            <div><label className="mb-1.5 block text-sm font-medium text-dark">Pertanyaan *</label><Input value={form.question} onChange={(e) => setForm(p => ({ ...p, question: e.target.value }))} placeholder="Pertanyaan" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-dark">Jawaban *</label><textarea value={form.answer} onChange={(e) => setForm(p => ({ ...p, answer: e.target.value }))} rows={4} className="w-full rounded-xl border border-dark-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Jawaban" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="mb-1.5 block text-sm font-medium text-dark">Kategori</label><Input value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))} placeholder="Umum" /></div>
              <div><label className="mb-1.5 block text-sm font-medium text-dark">Urutan</label><Input type="number" value={form.order} onChange={(e) => setForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} /></div>
            </div>
          </div>
          <div className="mt-4 flex gap-2"><Button onClick={handleSave} isLoading={isSaving}>Simpan</Button><Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button></div>
        </CardContent></Card>
      )}

      <div className="rounded-2xl border border-dark-100 bg-white">
        {isLoading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-dark-400" /></div>
        : faqs.length > 0 ? (
          <div className="divide-y divide-dark-50">
            {faqs.map((faq) => (
              <div key={faq.id} className="flex items-start justify-between gap-4 p-5">
                <div className="flex-1"><p className="font-medium text-dark">{faq.question}</p><p className="mt-1 text-sm text-dark-500 line-clamp-2">{faq.answer}</p></div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" onClick={() => { setEditId(faq.id); setForm({ question: faq.question, answer: faq.answer, category: faq.category || "", order: faq.order || 0 }); setShowForm(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(faq.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="flex flex-col items-center justify-center py-16"><HelpCircle className="h-10 w-10 text-dark-300" /><p className="mt-4 font-semibold text-dark">Belum ada FAQ</p></div>}
      </div>
      <ConfirmDialog open={!!deleteTarget} title="Hapus FAQ ini?" description="FAQ akan dihapus permanen." confirmLabel="Hapus" variant="danger" isLoading={isDeleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
