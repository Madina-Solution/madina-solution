"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Loader2, Package, Star, Search, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MediaUploader } from "@/components/ui/media-uploader";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { SiteImage } from "@/components/ui/site-image";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { OptionsEditor } from "@/components/admin/options-editor";
import type { ProductOption } from "@/db/schema";

type Product = {
  id: string; name: string; slug: string; basePrice: string; unit: string | null;
  isFeatured: boolean | null; isActive: boolean; shortDescription: string | null;
  categoryId: string | null; thumbnail: string | null; gallery: string[] | null; createdAt: string;
};

type Category = { id: string; name: string; slug: string };
type ProductForm = {
  name: string;
  slug: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  basePrice: string;
  unit: string;
  minOrder: number;
  productionDays: number;
  isFeatured: boolean;
  isActive: boolean;
  thumbnail: string;
  gallery: string[];
  options: ProductOption[];
  fulfillmentType: "physical" | "digital" | "hybrid";
};

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [form, setForm] = React.useState<ProductForm>({
    name: "", slug: "", categoryId: "", shortDescription: "", description: "",
    basePrice: "", unit: "pcs", minOrder: 1, productionDays: 3, isFeatured: false, isActive: true, thumbnail: "", gallery: [], options: [], fulfillmentType: "physical",
  });

  const fetchData = React.useCallback(async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/admin/products/list"),
        fetch("/api/admin/categories"),
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      if (prodData.success) setProducts(prodData.products);
      if (catData.success) setCategories(catData.categories);
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  }, []);

  React.useEffect(() => {
    void (async () => { await fetchData(); })();
  }, [fetchData]);

  const filteredProducts = React.useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q) || p.slug.includes(q));
  }, [products, search]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim() || !form.basePrice.trim()) {
      toast({ type: "error", title: "Nama, slug, dan harga wajib diisi" }); return;
    }
    setIsSaving(true);
    try {
      const url = editId ? `/api/admin/products/${editId}` : "/api/admin/products";
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, categoryId: form.categoryId || undefined }) });
      const data = await res.json();
      if (data.success) {
        toast({ type: "success", title: editId ? "Produk diperbarui" : "Produk dibuat" });
        resetForm(); fetchData();
      } else toast({ type: "error", title: data.error?.message || "Gagal menyimpan" });
    } catch { toast({ type: "error", title: "Terjadi kesalahan" }); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { toast({ type: "success", title: "Produk dinonaktifkan" }); fetchData(); }
      else toast({ type: "error", title: data.error?.message || "Gagal" });
    } catch { toast({ type: "error", title: "Terjadi kesalahan" }); }
    finally { setIsDeleting(false); setDeleteTarget(null); }
  };

  const handleToggle = async (id: string, field: string, value: boolean) => {
    const res = await fetch(`/api/admin/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: !value }) });
    if ((await res.json()).success) { toast({ type: "success", title: "Produk diperbarui" }); fetchData(); }
  };

  const startEdit = async (id: string) => {
    const res = await fetch(`/api/admin/products/${id}`);
    const data = await res.json();
    if (data.success) {
      const p = data.product;
      setForm({ thumbnail: p.thumbnail || "", gallery: Array.isArray(p.gallery) ? p.gallery : [], name: p.name, slug: p.slug, categoryId: p.categoryId || "", shortDescription: p.shortDescription || "", description: p.description || "", basePrice: p.basePrice, unit: p.unit || "pcs", minOrder: p.minOrder || 1, productionDays: p.productionDays || 3, isFeatured: p.isFeatured || false, isActive: p.isActive, options: Array.isArray(p.options) ? p.options : [], fulfillmentType: p.fulfillmentType || "physical" });
      setEditId(id); setShowForm(true);
    }
  };

  const resetForm = () => {
    setShowForm(false); setEditId(null);
    setForm({ thumbnail: "", gallery: [], name: "", slug: "", categoryId: "", shortDescription: "", description: "", basePrice: "", unit: "pcs", minOrder: 1, productionDays: 3, isFeatured: false, isActive: true, options: [], fulfillmentType: "physical" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-dark">Produk</h1><p className="mt-1 text-dark-500">{filteredProducts.length} produk</p></div>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
            <Input placeholder="Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button onClick={() => { resetForm(); setShowForm(true); }}><Plus className="mr-2 h-4 w-4" />Tambah</Button>
        </div>
      </div>

      {showForm && (
        <Card><CardContent className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-dark">{editId ? "Edit Produk" : "Tambah Produk"}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1.5 block text-sm font-medium text-dark">Nama *</label><Input value={form.name} onChange={(e) => { const n = e.target.value; setForm(p => ({ ...p, name: n, slug: editId ? p.slug : n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })); }} placeholder="Nama produk" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-dark">Slug *</label><Input value={form.slug} onChange={(e) => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="nama-produk" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-dark">Kategori</label>
              <select value={form.categoryId} onChange={(e) => setForm(p => ({ ...p, categoryId: e.target.value }))} className="h-11 w-full rounded-xl border border-dark-200 bg-white px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="">— Tanpa Kategori —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="mb-1.5 block text-sm font-medium text-dark">Harga Dasar *</label><Input value={form.basePrice} onChange={(e) => setForm(p => ({ ...p, basePrice: e.target.value }))} placeholder="25000" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-dark">Unit</label><Input value={form.unit} onChange={(e) => setForm(p => ({ ...p, unit: e.target.value }))} placeholder="pcs" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-dark">Min Order</label><Input type="number" value={form.minOrder} onChange={(e) => setForm(p => ({ ...p, minOrder: parseInt(e.target.value) || 1 }))} /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-dark">Hari Produksi</label><Input type="number" value={form.productionDays} onChange={(e) => setForm(p => ({ ...p, productionDays: parseInt(e.target.value) || 3 }))} /></div>
            <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-medium text-dark">Deskripsi Singkat</label><Input value={form.shortDescription} onChange={(e) => setForm(p => ({ ...p, shortDescription: e.target.value }))} placeholder="Deskripsi singkat" /></div>
            <div className="sm:col-span-2"><MediaUploader value={form.thumbnail} onChange={(value) => setForm(p => ({ ...p, thumbnail: Array.isArray(value) ? value[0] || "" : value }))} purpose="product_image" label="Thumbnail Produk" helpText="Gambar utama" allowVideo persist={editId ? { endpoint: `/api/admin/products/${editId}`, key: "thumbnail", mode: "replace", method: "PATCH" } : undefined} /><MediaUploader value={form.gallery} onChange={(value) => setForm(p => ({ ...p, gallery: Array.isArray(value) ? value : value ? [value] : [] }))} purpose="product_image" label="Gallery Produk" multiple maxFiles={12} helpText="Foto/video produk" allowVideo persist={editId ? { endpoint: `/api/admin/products/${editId}`, key: "gallery", mode: "replace", method: "PATCH" } : undefined} /></div>
            <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-medium text-dark">Deskripsi</label><textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full rounded-xl border border-dark-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Deskripsi lengkap" /></div>
            <div className="sm:col-span-2"><OptionsEditor value={form.options} onChange={(options) => setForm(p => ({ ...p, options }))} /><div className="mt-4 rounded-2xl border border-dark-100 bg-white p-4"><label className="mb-2 block text-sm font-semibold text-dark">Jenis pemenuhan</label><select value={form.fulfillmentType} onChange={(e) => setForm(p => ({ ...p, fulfillmentType: e.target.value as ProductForm["fulfillmentType"] }))} className="h-11 w-full rounded-xl border border-dark-200 bg-white px-4 text-sm"><option value="physical">Fisik — dikirim/diambil</option><option value="digital">Digital — file/hasil download</option><option value="hybrid">Hybrid — fisik + file digital</option></select></div></div><div className="flex items-center gap-4 sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm(p => ({ ...p, isFeatured: e.target.checked }))} className="h-4 w-4 rounded border-dark-300 text-primary" /><span className="text-sm text-dark-600">Produk Unggulan</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm(p => ({ ...p, isActive: e.target.checked }))} className="h-4 w-4 rounded border-dark-300 text-primary" /><span className="text-sm text-dark-600">Aktif</span></label>
            </div>
          </div>
          <div className="mt-4 flex gap-2"><Button onClick={handleSave} isLoading={isSaving}>{editId ? "Simpan Perubahan" : "Simpan"}</Button><Button variant="outline" onClick={resetForm}>Batal</Button></div>
        </CardContent></Card>
      )}

      <div className="rounded-2xl border border-dark-100 bg-white">
        {isLoading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-dark-400" /></div>
        : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-dark-100 text-left">
            <th className="px-5 py-3 font-medium text-dark-500">Produk</th>
            <th className="px-5 py-3 text-right font-medium text-dark-500">Harga</th>
            <th className="px-5 py-3 font-medium text-dark-500">Status</th>
            <th className="px-5 py-3 font-medium text-dark-500">Featured</th>
            <th className="px-5 py-3 font-medium text-dark-500">Aksi</th>
          </tr></thead><tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id} className="border-b border-dark-50 transition-colors hover:bg-dark-50/50 last:border-0">
                <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-dark-100 bg-dark-50">
                    {p.thumbnail ? (
                      p.thumbnail.includes("/video/upload/") || /\.(mp4|webm|mov)(?:[?#].*)?$/i.test(p.thumbnail) ? (
                        <video src={p.thumbnail} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                      ) : (
                        <SiteImage src={p.thumbnail} alt={p.name} fill sizes="64px" className="object-cover" />
                      )
                    ) : (
                      <MediaPlaceholder label="Belum ada thumbnail" className="h-full w-full" />
                    )}
                  </div>
                  <div><p className="font-medium text-dark">{p.name}</p><p className="text-xs text-dark-400">/{p.slug}</p></div>
                </div>
              </td>
                <td className="px-5 py-3.5 text-right font-medium text-dark">{formatCurrency(Number(p.basePrice))}/{p.unit || "pcs"}</td>
                <td className="px-5 py-3.5"><button onClick={() => handleToggle(p.id, "isActive", p.isActive)}><Badge variant={p.isActive ? "success" : "error"}>{p.isActive ? "Aktif" : "Nonaktif"}</Badge></button></td>
                <td className="px-5 py-3.5"><button onClick={() => handleToggle(p.id, "isFeatured", !!p.isFeatured)}>{p.isFeatured ? <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> : <Star className="h-4 w-4 text-dark-300" />}</button></td>
                <td className="px-5 py-3.5"><div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(p.id)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ id: p.id, name: p.name })}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div></td>
              </tr>
            ))}
          </tbody></table></div>
        ) : <div className="flex flex-col items-center justify-center py-16"><Package className="h-10 w-10 text-dark-300" /><p className="mt-4 font-semibold text-dark">Belum ada produk</p><p className="mt-1 text-sm text-dark-500">Tambahkan produk pertama untuk toko Anda.</p></div>}
      </div>

      <ConfirmDialog open={!!deleteTarget} title={`Nonaktifkan "${deleteTarget?.name}"?`} description="Produk akan dinonaktifkan dan tidak tampil di toko." confirmLabel="Nonaktifkan" variant="danger" isLoading={isDeleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
