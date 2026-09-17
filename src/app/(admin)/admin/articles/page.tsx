"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Loader2, FileText, Globe2, Search, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MediaUploader } from "@/components/ui/media-uploader";
import { RichTextEditor } from "@/components/admin/wysiwyg-editor";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

type Article = {
  id: string; title: string; slug: string; excerpt: string | null; content: string | null;
  thumbnail: string | null; category: string | null; tags?: string[] | null;
  isPublished: boolean | null; publishedAt: string | null; createdAt: string;
  metadata?: { seo?: { title?: string; description?: string; keywords?: string[]; canonicalUrl?: string; noIndex?: boolean; ogImage?: string; ogTitle?: string; ogDescription?: string; twitterTitle?: string; twitterDescription?: string }; editorial?: { featured?: boolean; authorName?: string; readingTime?: number; allowComments?: boolean } };
};

type ArticleForm = {
  thumbnail: string; title: string; slug: string; excerpt: string; content: string; category: string; tags: string;
  isPublished: boolean; seoTitle: string; seoDescription: string; seoKeywords: string; canonicalUrl: string; noIndex: boolean;
  ogImage: string; ogTitle: string; ogDescription: string; twitterTitle: string; twitterDescription: string;
  featured: boolean; authorName: string; readingTime: number;
};

const EMPTY: ArticleForm = { thumbnail: "", title: "", slug: "", excerpt: "", content: "", category: "", tags: "", isPublished: false, seoTitle: "", seoDescription: "", seoKeywords: "", canonicalUrl: "", noIndex: false, ogImage: "", ogTitle: "", ogDescription: "", twitterTitle: "", twitterDescription: "", featured: false, authorName: "", readingTime: 0 };

export default function AdminArticlesPage() {
  const { toast } = useToast();
  const [items, setItems] = React.useState<Article[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; title: string } | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [form, setForm] = React.useState<ArticleForm>({ ...EMPTY });

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const r = await fetch("/api/admin/articles", { cache: "no-store" });
      const d = await r.json();
      if (!d.success) throw new Error(d.error?.message || "Gagal memuat artikel");
      setItems(d.articles || []);
    } catch (e) { toast({ type: "error", title: e instanceof Error ? e.message : "Gagal memuat artikel" }); }
    finally { setIsLoading(false); }
  }, [toast]);

  React.useEffect(() => { void fetchData(); }, [fetchData]);

  const resetForm = () => { setShowForm(false); setEditId(null); setForm({ ...EMPTY }); };
  const slugify = (v: string) => v.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 255);
  const filtered = React.useMemo(() => { const q = search.toLowerCase().trim(); return q ? items.filter((a) => [a.title,a.slug,a.category,...(a.tags||[])].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))) : items; }, [items, search]);

  const startEdit = (a: Article) => {
    const seo = a.metadata?.seo || {}; const editorial = a.metadata?.editorial || {};
    setForm({ thumbnail: a.thumbnail || "", title: a.title, slug: a.slug, excerpt: a.excerpt || "", content: a.content || "", category: a.category || "", tags: (a.tags || []).join(", "), isPublished: !!a.isPublished, seoTitle: seo.title || "", seoDescription: seo.description || "", seoKeywords: (seo.keywords || []).join(", "), canonicalUrl: seo.canonicalUrl || "", noIndex: !!seo.noIndex, ogImage: seo.ogImage || "", ogTitle: seo.ogTitle || "", ogDescription: seo.ogDescription || "", twitterTitle: seo.twitterTitle || "", twitterDescription: seo.twitterDescription || "", featured: !!editorial.featured, authorName: editorial.authorName || "", readingTime: editorial.readingTime || 0 });
    setEditId(a.id); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) { toast({ type: "error", title: "Judul dan slug wajib diisi" }); return; }
    setIsSaving(true);
    try {
      const payload = { thumbnail: form.thumbnail, title: form.title, slug: form.slug, excerpt: form.excerpt, content: form.content, category: form.category, tags: form.tags.split(",").map((v)=>v.trim()).filter(Boolean).slice(0,30), isPublished: form.isPublished, metadata: { seo: { title: form.seoTitle, description: form.seoDescription, keywords: form.seoKeywords.split(",").map((v)=>v.trim()).filter(Boolean).slice(0,30), canonicalUrl: form.canonicalUrl, noIndex: form.noIndex, ogImage: form.ogImage, ogTitle: form.ogTitle, ogDescription: form.ogDescription, twitterTitle: form.twitterTitle, twitterDescription: form.twitterDescription }, editorial: { featured: form.featured, authorName: form.authorName, readingTime: form.readingTime || undefined } } };
      const r = await fetch(editId ? `/api/admin/articles/${editId}` : "/api/admin/articles", { method: editId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const d = await r.json(); if (!r.ok || !d.success) throw new Error(d.error?.message || "Gagal menyimpan artikel");
      toast({ type: "success", title: editId ? "Artikel diperbarui" : "Artikel dibuat" }); resetForm(); await fetchData();
    } catch (e) { toast({ type: "error", title: e instanceof Error ? e.message : "Gagal menyimpan artikel" }); }
    finally { setIsSaving(false); }
  };
  const togglePublish = async (id: string, current: boolean) => { const r=await fetch(`/api/admin/articles/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({isPublished:!current})}); const d=await r.json(); if(d.success){await fetchData();toast({type:"success",title:current?"Artikel dijadikan draft":"Artikel diterbitkan"});} };
  const archive = async () => { if(!deleteTarget)return; setIsDeleting(true); try{const r=await fetch(`/api/admin/articles/${deleteTarget.id}`,{method:"DELETE"});const d=await r.json();if(!r.ok||!d.success)throw new Error(d.error?.message||"Gagal mengarsipkan");await fetchData();toast({type:"success",title:"Artikel diarsipkan"});}catch(e){toast({type:"error",title:e instanceof Error?e.message:"Gagal"});}finally{setIsDeleting(false);setDeleteTarget(null);} };

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold text-dark">Blog & Editorial CMS</h1><p className="mt-1 text-sm text-dark-500">{items.length} artikel • konten lama tetap dapat diedit</p></div><div className="flex gap-2"><div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400"/><Input aria-label="Cari artikel" placeholder="Cari judul, slug, kategori…" value={search} onChange={(e)=>setSearch(e.target.value)} className="pl-9"/></div><Button onClick={()=>{setForm({...EMPTY});setEditId(null);setShowForm(true)}}><Plus className="mr-2 h-4 w-4"/>Artikel</Button></div></header>
    {showForm && <Card className="overflow-hidden"><CardContent className="p-5 lg:p-7"><div className="mb-6 flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold text-dark">{editId?"Edit Artikel":"Artikel Baru"}</h2><p className="mt-1 text-xs text-dark-500">Jangan khawatir terhadap data lama: konten existing dimuat penuh ke editor.</p></div><Button variant="ghost" size="icon" onClick={resetForm} aria-label="Tutup editor artikel"><X className="h-5 w-5"/></Button></div>
      <div className="grid gap-5 lg:grid-cols-3"><div className="space-y-4 lg:col-span-2"><div className="grid gap-4 md:grid-cols-2"><Field label="Judul *"><Input value={form.title} onChange={(e)=>setForm(p=>({...p,title:e.target.value,slug:editId?p.slug:slugify(e.target.value)}))}/></Field><Field label="Slug *"><Input value={form.slug} onChange={(e)=>setForm(p=>({...p,slug:slugify(e.target.value)}))}/></Field><Field label="Kategori"><Input value={form.category} onChange={(e)=>setForm(p=>({...p,category:e.target.value}))}/></Field><Field label="Tags"><Input value={form.tags} onChange={(e)=>setForm(p=>({...p,tags:e.target.value}))} placeholder="branding, printing, UMKM"/></Field></div><Field label="Excerpt" help="Ringkasan untuk listing dan fallback meta description."><Input maxLength={1000} value={form.excerpt} onChange={(e)=>setForm(p=>({...p,excerpt:e.target.value}))}/></Field><RichTextEditor label="Konten artikel" value={form.content} onChange={(content)=>setForm(p=>({...p,content}))} minHeight={480}/></div><div className="space-y-4"><MediaUploader value={form.thumbnail} onChange={(v)=>setForm(p=>({...p,thumbnail:Array.isArray(v)?v[0]||"":v}))} purpose="article_image" label="Featured image"/><div className="rounded-2xl border border-dark-100 bg-dark-50/50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-primary">Editorial</p><div className="mt-3 space-y-3"><Field label="Penulis tampilan"><Input value={form.authorName} onChange={(e)=>setForm(p=>({...p,authorName:e.target.value}))}/></Field><Field label="Reading time (menit)"><Input type="number" min={0} value={form.readingTime} onChange={(e)=>setForm(p=>({...p,readingTime:Math.max(0,Number(e.target.value)||0)}))}/></Field><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e)=>setForm(p=>({...p,featured:e.target.checked}))}/>Featured article</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isPublished} onChange={(e)=>setForm(p=>({...p,isPublished:e.target.checked}))}/>Publish</label></div></div></div></div>
      <div className="mt-6 rounded-2xl border border-dark-100 bg-dark-50/50 p-5"><div className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-primary"/><h3 className="font-semibold text-dark">SEO & Social Metadata</h3></div><div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="SEO title"><Input maxLength={65} value={form.seoTitle} onChange={(e)=>setForm(p=>({...p,seoTitle:e.target.value}))}/></Field><Field label="Canonical URL"><Input value={form.canonicalUrl} onChange={(e)=>setForm(p=>({...p,canonicalUrl:e.target.value}))}/></Field><Field label="Meta description"><textarea maxLength={160} rows={3} value={form.seoDescription} onChange={(e)=>setForm(p=>({...p,seoDescription:e.target.value}))} className="w-full rounded-xl border border-dark-200 bg-white p-3 text-sm"/></Field><Field label="SEO keywords"><Input value={form.seoKeywords} onChange={(e)=>setForm(p=>({...p,seoKeywords:e.target.value}))}/></Field><Field label="OG title"><Input value={form.ogTitle} onChange={(e)=>setForm(p=>({...p,ogTitle:e.target.value}))}/></Field><Field label="OG image"><Input value={form.ogImage} onChange={(e)=>setForm(p=>({...p,ogImage:e.target.value}))}/></Field><Field label="OG description"><textarea rows={2} value={form.ogDescription} onChange={(e)=>setForm(p=>({...p,ogDescription:e.target.value}))} className="w-full rounded-xl border border-dark-200 bg-white p-3 text-sm"/></Field><Field label="Twitter title"><Input value={form.twitterTitle} onChange={(e)=>setForm(p=>({...p,twitterTitle:e.target.value}))}/></Field><Field label="Twitter description"><textarea rows={2} value={form.twitterDescription} onChange={(e)=>setForm(p=>({...p,twitterDescription:e.target.value}))} className="w-full rounded-xl border border-dark-200 bg-white p-3 text-sm"/></Field><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.noIndex} onChange={(e)=>setForm(p=>({...p,noIndex:e.target.checked}))}/>Noindex</label></div></div>
      <div className="mt-6 flex justify-end gap-2 border-t border-dark-100 pt-5"><Button variant="outline" onClick={resetForm}>Batal</Button><Button onClick={handleSave} isLoading={isSaving}><Save className="mr-2 h-4 w-4"/>{editId?"Simpan perubahan":"Buat artikel"}</Button></div>
    </CardContent></Card>}
    <div className="overflow-hidden rounded-2xl border border-dark-100 bg-white">{isLoading?<div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-dark-400"/></div>:filtered.length?<div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-dark-100 text-left"><th className="px-5 py-3 font-medium text-dark-500">Artikel</th><th className="px-5 py-3">Kategori</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Tanggal</th><th className="px-5 py-3">Aksi</th></tr></thead><tbody>{filtered.map(a=><tr key={a.id} className="border-b border-dark-50 last:border-0 hover:bg-dark-50/50"><td className="px-5 py-3.5"><p className="font-medium text-dark">{a.title}</p><p className="text-xs text-dark-400">/{a.slug}</p></td><td className="px-5 py-3.5 text-dark-600">{a.category||"—"}</td><td className="px-5 py-3.5"><button type="button" aria-label={`${a.isPublished?"Jadikan draft":"Terbitkan"} artikel ${a.title}`} onClick={()=>void togglePublish(a.id,!!a.isPublished)}><Badge variant={a.isPublished?"success":"warning"}>{a.isPublished?"Terbit":"Draft"}</Badge></button></td><td className="px-5 py-3.5 text-xs text-dark-500">{formatDate(a.createdAt)}</td><td className="px-5 py-3.5"><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={()=>startEdit(a)} aria-label={`Edit ${a.title}`}><Pencil className="h-4 w-4"/></Button><Button variant="ghost" size="icon" onClick={()=>setDeleteTarget({id:a.id,title:a.title})} aria-label={`Arsipkan ${a.title}`}><Trash2 className="h-4 w-4 text-red-500"/></Button></div></td></tr>)}</tbody></table></div>:<div className="flex flex-col items-center justify-center py-16"><FileText className="h-10 w-10 text-dark-300"/><p className="mt-4 font-semibold text-dark">Belum ada artikel</p><p className="mt-1 text-sm text-dark-500">Artikel lama tetap dipertahankan di database.</p></div>}</div>
    <ConfirmDialog open={!!deleteTarget} title={`Arsipkan "${deleteTarget?.title}"?`} description="Artikel tidak dihapus dari database. Artikel akan menjadi draft agar histori konten tetap aman." confirmLabel="Arsipkan" variant="danger" isLoading={isDeleting} onConfirm={archive} onCancel={()=>setDeleteTarget(null)}/>
  </div>;
}
function Field({label,help,children}:{label:string;help?:string;children:React.ReactNode}){return <div><label className="mb-1.5 block text-sm font-medium text-dark">{label}</label>{children}{help&&<p className="mt-1 text-xs text-dark-500">{help}</p>}</div>}
