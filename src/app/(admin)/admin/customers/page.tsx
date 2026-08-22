"use client";

import * as React from "react";
import { Loader2, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils";

type Customer = { id: string; name: string; email: string; phone: string | null; role: string; isActive: boolean; createdAt: string; orderCount: number; totalSpend: number };

export default function AdminCustomersPage() {
  const { toast } = useToast();
  const [items, setItems] = React.useState<Customer[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  const fetchData = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      if (data.success) setItems(data.customers);
    } catch {} finally { setIsLoading(false); }
  }, []);
  React.useEffect(() => {
    void (async () => { await fetchData(); })();
  }, [fetchData]);

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const res = await fetch(`/api/admin/customers/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !currentActive }) });
    if ((await res.json()).success) { toast({ type: "success", title: currentActive ? "User dinonaktifkan" : "User diaktifkan" }); fetchData(); }
    else toast({ type: "error", title: "Gagal" });
  };

  const filtered = React.useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.phone || "").includes(q));
  }, [items, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-dark">Pelanggan</h1><p className="mt-1 text-dark-500">{filtered.length} pelanggan</p></div>
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
          <Input placeholder="Cari pelanggan..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>
      <div className="rounded-2xl border border-dark-100 bg-white">
        {isLoading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-dark-400" /></div>
        : filtered.length > 0 ? (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-dark-100 text-left">
            <th className="px-5 py-3 font-medium text-dark-500">Pelanggan</th>
            <th className="px-5 py-3 font-medium text-dark-500">Telepon</th>
            <th className="px-5 py-3 font-medium text-dark-500">Pesanan</th>
            <th className="px-5 py-3 text-right font-medium text-dark-500">Total Belanja</th>
            <th className="px-5 py-3 font-medium text-dark-500">Status</th>
            <th className="px-5 py-3 font-medium text-dark-500">Bergabung</th>
          </tr></thead><tbody>{filtered.map((c) => (
            <tr key={c.id} className="border-b border-dark-50 last:border-0 hover:bg-dark-50/50">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{c.name.charAt(0).toUpperCase()}</div>
                  <div><p className="font-medium text-dark">{c.name}</p><p className="text-xs text-dark-400">{c.email}</p></div>
                </div>
              </td>
              <td className="px-5 py-3.5 text-dark-600">{c.phone || "—"}</td>
              <td className="px-5 py-3.5 text-dark-600">{c.orderCount}</td>
              <td className="px-5 py-3.5 text-right font-medium text-dark">{formatCurrency(c.totalSpend)}</td>
              <td className="px-5 py-3.5"><button onClick={() => handleToggleActive(c.id, c.isActive)}><Badge variant={c.isActive ? "success" : "error"}>{c.isActive ? "Aktif" : "Nonaktif"}</Badge></button></td>
              <td className="px-5 py-3.5 text-xs text-dark-500">{formatDate(c.createdAt)}</td>
            </tr>
          ))}</tbody></table></div>
        ) : <div className="flex flex-col items-center justify-center py-16"><Users className="h-10 w-10 text-dark-300" /><p className="mt-4 font-semibold text-dark">{search ? "Tidak ditemukan" : "Belum ada pelanggan"}</p></div>}
      </div>
    </div>
  );
}
