"use client";

import * as React from "react";
import { Settings as SettingsIcon, Save, Loader2, Globe, Phone, Mail, MapPin, CreditCard, HardDrive, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { BRAND } from "@/lib/constants";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = React.useState<Record<string, unknown>>({});
  const [integrations, setIntegrations] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [form, setForm] = React.useState({ siteName: BRAND.name as string, siteEmail: BRAND.email as string, sitePhone: "+62 813-9300-5035", siteAddress: BRAND.address as string, siteWhatsapp: BRAND.whatsapp as string });

  const fetchSettings = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setIntegrations((data.settings._integrations as Record<string, string>) || {});
        const s = data.settings;
        if (s.site_name) setForm(f => ({ ...f, siteName: String((s.site_name as Record<string, unknown>)?.value || f.siteName) }));
      }
    } catch {} finally { setIsLoading(false); }
  }, []);

  React.useEffect(() => {
    void (async () => { await fetchSettings(); })();
  }, [fetchSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_name: { value: form.siteName },
          site_email: { value: form.siteEmail },
          site_phone: { value: form.sitePhone },
          site_address: { value: form.siteAddress },
          site_whatsapp: { value: form.siteWhatsapp },
        }),
      });
      const data = await res.json();
      if (data.success) toast({ type: "success", title: "Pengaturan disimpan" });
      else toast({ type: "error", title: data.error?.message || "Gagal" });
    } catch { toast({ type: "error", title: "Gagal menyimpan" }); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-dark-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-dark">Pengaturan</h1><p className="mt-1 text-dark-500">Konfigurasi platform</p></div>
        <Button onClick={handleSave} isLoading={isSaving}><Save className="mr-2 h-4 w-4" />Simpan Pengaturan</Button>
      </div>

      {/* Business Info */}
      <Card>
        <CardContent className="p-6">
          <h2 className="flex items-center gap-2 font-semibold text-dark"><Globe className="h-5 w-5 text-primary" />Informasi Bisnis</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1.5 block text-sm font-medium text-dark">Nama Bisnis</label><Input value={form.siteName} onChange={(e) => setForm(p => ({ ...p, siteName: e.target.value }))} /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-dark">Email</label><Input value={form.siteEmail} onChange={(e) => setForm(p => ({ ...p, siteEmail: e.target.value }))} /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-dark">Telepon</label><Input value={form.sitePhone} onChange={(e) => setForm(p => ({ ...p, sitePhone: e.target.value }))} /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-dark">WhatsApp</label><Input value={form.siteWhatsapp} onChange={(e) => setForm(p => ({ ...p, siteWhatsapp: e.target.value }))} /></div>
            <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-medium text-dark">Alamat</label><Input value={form.siteAddress} onChange={(e) => setForm(p => ({ ...p, siteAddress: e.target.value }))} /></div>
          </div>
        </CardContent>
      </Card>

      {/* Integrations Status */}
      <Card>
        <CardContent className="p-6">
          <h2 className="flex items-center gap-2 font-semibold text-dark"><Server className="h-5 w-5 text-primary" />Status Integrasi</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-dark-100 p-4">
              <div className="flex items-center gap-3"><CreditCard className="h-5 w-5 text-dark-500" /><div><p className="font-medium text-dark">Payment</p><p className="text-xs text-dark-500">Gateway pembayaran</p></div></div>
              <Badge variant={integrations.payment === "mock" ? "warning" : "success"}>{integrations.payment === "mock" ? "Development" : integrations.payment || "—"}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-dark-100 p-4">
              <div className="flex items-center gap-3"><HardDrive className="h-5 w-5 text-dark-500" /><div><p className="font-medium text-dark">Storage</p><p className="text-xs text-dark-500">Penyimpanan file</p></div></div>
              <Badge variant={integrations.storage === "local" ? "warning" : "success"}>{integrations.storage || "—"}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-dark-100 p-4">
              <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-dark-500" /><div><p className="font-medium text-dark">Email</p><p className="text-xs text-dark-500">Notifikasi email</p></div></div>
              <Badge variant={integrations.email === "configured" ? "success" : "error"}>{integrations.email === "configured" ? "Aktif" : "Belum dikonfigurasi"}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-dark-100 p-4">
              <div className="flex items-center gap-3"><Server className="h-5 w-5 text-dark-500" /><div><p className="font-medium text-dark">Database</p><p className="text-xs text-dark-500">PostgreSQL</p></div></div>
              <Badge variant="success">Connected</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
