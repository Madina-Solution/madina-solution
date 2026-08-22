"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth/auth-provider";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", phone: "" });

  if (!user) return null;

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ type: "error", title: "Nama wajib diisi" }); return; }
    setIsSaving(true);
    try {
      const res = await fetch("/api/account/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { toast({ type: "success", title: "Profil diperbarui" }); setIsEditing(false); refresh(); }
      else toast({ type: "error", title: data.error?.message || "Gagal" });
    } catch { toast({ type: "error", title: "Terjadi kesalahan" }); }
    finally { setIsSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-dark">Profil Saya</h2><p className="mt-1 text-dark-500">Kelola informasi profil Anda</p></div>
        {!isEditing && <Button variant="outline" onClick={() => { setForm({ name: user.name, phone: "" }); setIsEditing(true); }}>Edit Profil</Button>}
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">{user.name.charAt(0).toUpperCase()}</div>
            <div>
              <h3 className="text-lg font-semibold text-dark">{user.name}</h3>
              <p className="text-dark-500">{user.email}</p>
              <Badge className="mt-1" variant="secondary">{user.role === "customer" ? "Pelanggan" : user.role}</Badge>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4 border-t border-dark-100 pt-6">
              <div><label className="mb-1.5 block text-sm font-medium text-dark">Nama</label><Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label className="mb-1.5 block text-sm font-medium text-dark">Telepon</label><Input value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="08xx-xxxx-xxxx" /></div>
              <div className="flex gap-2"><Button onClick={handleSave} isLoading={isSaving}>Simpan</Button><Button variant="outline" onClick={() => setIsEditing(false)}>Batal</Button></div>
            </div>
          ) : (
            <div className="space-y-3 border-t border-dark-100 pt-6 text-sm">
              <div className="flex justify-between"><span className="text-dark-500">Email</span><span className="text-dark">{user.email}</span></div>
              <div className="flex justify-between"><span className="text-dark-500">Role</span><span className="text-dark capitalize">{user.role}</span></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
