"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Loader2, Briefcase, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";

type Service = { id: string; name: string; slug: string; shortDescription: string | null; startingPrice: string | null; estimatedDays: number | null; isFeatured: boolean | null; isActive: boolean };

export default function AdminServicesPage() {
  const { toast } = useToast();
  const [items, setItems] = React.useState<Service[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", slug: "", shortDescription: "", description: "", startingPrice: "", estimatedDays: 7, isFeatured: false, isActive: true });

  const fetchData = React.useCallback(async () => {
    try { const r = await fetch("/api/admin/services"); const d = await r.json(); if (d.success) setItems(d.services); } catch {} finally { setIsLoading(false); }
  }, []);
  React.useEffect(() => {
    void (async () => { await fetchData(); })();
  }, [fetchData]);

  const resetForm = () => { setShowForm(false); setEditId(null); setForm({ name: "", slug: "", shortDescription: "", description: "", startingPrice: "", estimatedDays: 7, isFeatured: false, isActive: true }); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) { toast({ type: "error", title: "Nama dan slug wajib diisi" }); return; }
    setIsSaving(true);
    try {
      const url = editId ? `/api/admin/services/${editId}` : "/api/admin/services";
      const res = await fetch(url, { method: editId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { toast({ type: "success", title: editId ? "Layanan diperbarui" : "Layanan dibuat" }); resetForm(); fetchData(); }
      else toast({ type: "error", title: data.error?.message || "Gagal" });
    } catch { toast({ type: "error", title: "Terjadi kesalahan" }); } finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return; setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/services/${deleteTarget.id}`, { method: "DELETE" });
      if ((await res.json()).success) { toast({ type: "success", title: "Layanan dinonaktifkan" }); fetchData(); }
    } catch { toast({ type: "error", title: "Gagal" }); } finally { setIsDeleting(false); setDeleteTarget(null); }
  };

  const handleToggle = async (id: string, field: string, value: boolean) => {
    const res = await fetch(`/api/admin/services/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: !value }) });
    if ((await res.json()).success) { toast({ type: "success", title: "Diperbarui" }); fetchData(); }
  };

  const startEdit = (s: Service) => {
    setForm({ name: s.name, slug: s.slug, shortDescription: s.shortDescription || "", description: "", startingPrice: s.startingPrice || "", estimatedDays: s.estimatedDays || 7, isFeatured: !!s.isFeatured, isActive: s.isActive });
    setEditId(s.id); setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-dark">Layanan</h1><p className="mt-1 text-dark-500">{items.length} layanan</p></div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}><Plus className="mr-2 h-4 w-4" />Tambah Layanan</Button>
      </div>

      {showForm && (
        <Card><CardContent className="p-6">
          <h2 className="mb-4 font-semibold text-dark">{editId ? "Edit Layanan" : "Tambah Layanan"}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1.5 block text-sm font-medium text-dark">Nama *</label><Input value={form.name} onChange={(e) => { const n = e.target.value; setForm(p => ({ ...p, name: n, slug: editId ? p.slug : n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })); }} placeholder="Nama layanan" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-dark">Slug *</label><Input value={form.slug} onChange={(e) => setForm(p => ({ ...p, slug: e.target.value }))} /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-dark">Harga Mulai</label><Input value={form.startingPrice} onChange={(e) => setForm(p => ({ ...p, startingPrice: e.target.value }))} placeholder="500000" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-dark">Estimasi (hari)</label><Input type="number" value={form.estimatedDays} onChange={(e) => setForm(p => ({ ...p, estimatedDays: parseInt(e.target.value) || 7 }))} /></div>
            <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-medium text-dark">Deskripsi Singkat</label><Input value={form.shortDescription} onChange={(e) => setForm(p => ({ ...p, shortDescription: e.target.value }))} placeholder="Deskripsi singkat layanan" /></div>
            <div className="flex items-center gap-4 sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm(p => ({ ...p, isFeatured: e.target.checked }))} className="h-4 w-4 rounded border-dark-300 text-primary" /><span className="text-sm text-dark-600">Unggulan</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm(p => ({ ...p, isActive: e.target.checked }))} className="h-4 w-4 rounded border-dark-300 text-primary" /><span className="text-sm text-dark-600">Aktif</span></label>
            </div>
          </div>
          <div className="mt-4 flex gap-2"><Button onClick={handleSave} isLoading={isSaving}>{editId ? "Simpan Perubahan" : "Simpan"}</Button><Button variant="outline" onClick={resetForm}>Batal</Button></div>
        </CardContent></Card>
      )}

      <div className="rounded-2xl border border-dark-100 bg-white">
        {isLoading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-dark-400" /></div>
        : items.length > 0 ? (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-dark-100 text-left">
            <th className="px-5 py-3 font-medium text-dark-500">Layanan</th>
            <th className="px-5 py-3 text-right font-medium text-dark-500">Harga Mulai</th>
            <th className="px-5 py-3 font-medium text-dark-500">Estimasi</th>
            <th className="px-5 py-3 font-medium text-dark-500">Status</th>
            <th className="px-5 py-3 font-medium text-dark-500">Aksi</th>
          </tr></thead><tbody>
            {items.map((s) => (
              <tr key={s.id} className="border-b border-dark-50 last:border-0 hover:bg-dark-50/50">
                <td className="px-5 py-3.5"><p className="font-medium text-dark">{s.name}</p>{s.shortDescription && <p className="text-xs text-dark-400 line-clamp-1">{s.shortDescription}</p>}</td>
                <td className="px-5 py-3.5 text-right text-dark-600">{s.startingPrice ? formatCurrency(Number(s.startingPrice)) : "—"}</td>
                <td className="px-5 py-3.5 text-dark-600">{s.estimatedDays || 7} hari</td>
                <td className="px-5 py-3.5"><button onClick={() => handleToggle(s.id, "isActive", s.isActive)}><Badge variant={s.isActive ? "success" : "error"}>{s.isActive ? "Aktif" : "Nonaktif"}</Badge></button></td>
                <td className="px-5 py-3.5"><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => startEdit(s)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ id: s.id, name: s.name })}><Trash2 className="h-4 w-4 text-red-500" /></Button></div></td>
              </tr>
            ))}
          </tbody></table></div>
        ) : <div className="flex flex-col items-center justify-center py-16"><Briefcase className="h-10 w-10 text-dark-300" /><p className="mt-4 font-semibold text-dark">Belum ada layanan</p></div>}
      </div>
      <ConfirmDialog open={!!deleteTarget} title={`Nonaktifkan "${deleteTarget?.name}"?`} description="Layanan akan dinonaktifkan." confirmLabel="Nonaktifkan" variant="danger" isLoading={isDeleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
