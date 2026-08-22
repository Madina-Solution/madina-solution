"use client";

import * as React from "react";
import { Loader2, Users, Search, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

type User = { id: string; name: string; email: string; phone: string | null; role: string; isActive: boolean; createdAt: string };

const ROLE_LABELS: Record<string, string> = { super_admin: "Super Admin", admin: "Admin", manager: "Manager", staff: "Staff", designer: "Designer", production: "Production", customer: "Pelanggan" };
const ROLE_COLORS: Record<string, string> = { super_admin: "bg-red-100 text-red-700", admin: "bg-purple-100 text-purple-700", manager: "bg-blue-100 text-blue-700", staff: "bg-green-100 text-green-700", designer: "bg-orange-100 text-orange-700", production: "bg-cyan-100 text-cyan-700", customer: "bg-dark-100 text-dark-600" };
const ASSIGNABLE_ROLES = ["customer", "staff", "designer", "production", "manager", "admin"];

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [items, setItems] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  const fetchData = React.useCallback(async () => {
    try { const r = await fetch("/api/admin/users"); const d = await r.json(); if (d.success) setItems(d.users); } catch {} finally { setIsLoading(false); }
  }, []);
  React.useEffect(() => {
    void (async () => { await fetchData(); })();
  }, [fetchData]);

  const handleRoleChange = async (id: string, newRole: string) => {
    const res = await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: newRole }) });
    const data = await res.json();
    if (data.success) { toast({ type: "success", title: `Role diubah ke ${ROLE_LABELS[newRole] || newRole}` }); fetchData(); }
    else toast({ type: "error", title: data.error?.message || "Gagal" });
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !current }) });
    if ((await res.json()).success) { toast({ type: "success", title: current ? "User dinonaktifkan" : "User diaktifkan" }); fetchData(); }
  };

  const filtered = React.useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [items, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-dark">Users & Roles</h1><p className="mt-1 text-dark-500">{filtered.length} pengguna</p></div>
        <div className="relative sm:w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" /><Input placeholder="Cari user..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
      </div>

      <div className="rounded-2xl border border-dark-100 bg-white">
        {isLoading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-dark-400" /></div>
        : filtered.length > 0 ? (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-dark-100 text-left">
            <th className="px-5 py-3 font-medium text-dark-500">User</th>
            <th className="px-5 py-3 font-medium text-dark-500">Role</th>
            <th className="px-5 py-3 font-medium text-dark-500">Status</th>
            <th className="px-5 py-3 font-medium text-dark-500">Bergabung</th>
            <th className="px-5 py-3 font-medium text-dark-500">Aksi</th>
          </tr></thead><tbody>{filtered.map((u) => (
            <tr key={u.id} className="border-b border-dark-50 last:border-0 hover:bg-dark-50/50">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{u.name.charAt(0).toUpperCase()}</div>
                  <div><p className="font-medium text-dark">{u.name}</p><p className="text-xs text-dark-400">{u.email}</p></div>
                </div>
              </td>
              <td className="px-5 py-3.5">
                <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} className="rounded-lg border border-dark-200 bg-white px-2 py-1 text-xs font-medium text-dark focus:border-primary focus:outline-none">
                  {ASSIGNABLE_ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>)}
                </select>
              </td>
              <td className="px-5 py-3.5"><button onClick={() => handleToggleActive(u.id, u.isActive)}><Badge variant={u.isActive ? "success" : "error"}>{u.isActive ? "Aktif" : "Nonaktif"}</Badge></button></td>
              <td className="px-5 py-3.5 text-xs text-dark-500">{formatDate(u.createdAt)}</td>
              <td className="px-5 py-3.5"><span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_COLORS[u.role] || "bg-dark-100 text-dark-600"}`}>{ROLE_LABELS[u.role] || u.role}</span></td>
            </tr>
          ))}</tbody></table></div>
        ) : <div className="flex flex-col items-center justify-center py-16"><Users className="h-10 w-10 text-dark-300" /><p className="mt-4 font-semibold text-dark">{search ? "Tidak ditemukan" : "Belum ada user"}</p></div>}
      </div>
    </div>
  );
}
