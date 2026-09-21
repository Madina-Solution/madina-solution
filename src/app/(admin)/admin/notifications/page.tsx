"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, CheckCheck, Loader2, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  orderId: string | null;
  readAt: string | null;
  createdAt: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function AdminNotificationsPage() {
  const { toast } = useToast();
  const [items, setItems] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error?.message || "Gagal memuat notifikasi");
      setItems(data.notifications || []);
    } catch (error) {
      if (!silent) toast({ type: "error", title: "Notifikasi gagal dimuat", description: error instanceof Error ? error.message : undefined });
    } finally {
      if (!silent) setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    const initial = window.setTimeout(() => void load(), 0);
    const interval = window.setInterval(() => void load(true), 5000);
    return () => { window.clearTimeout(initial); window.clearInterval(interval); };
  }, [load]);

  const markRead = async (id: string) => {
    const response = await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    if (response.ok) setItems((current) => current.map((item) => item.id === id ? { ...item, readAt: new Date().toISOString() } : item));
  };

  const unread = items.filter((item) => !item.readAt).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Workspace Notifications</p><h1 className="mt-1 text-2xl font-black tracking-tight text-dark dark:text-white">Notifikasi</h1><p className="mt-1 text-sm text-dark-500 dark:text-slate-400">Pemberitahuan akun, pesan pelanggan, pembayaran, dan perubahan pesanan.</p></div>
        <div className="flex items-center gap-2"><span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-black text-primary">{unread} belum dibaca</span><button type="button" onClick={() => void load()} className="flex h-9 w-9 items-center justify-center rounded-xl border border-dark-100 bg-white text-dark-500 hover:border-primary/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300" aria-label="Refresh notifikasi"><RefreshCcw className="h-4 w-4" /></button></div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-dark-100 bg-white dark:border-slate-800 dark:bg-slate-950">
        {loading ? <div className="flex min-h-[240px] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : items.length === 0 ? <div className="px-5 py-16 text-center"><Bell className="mx-auto h-9 w-9 text-dark-300 dark:text-slate-700" /><p className="mt-3 font-bold text-dark dark:text-white">Belum ada notifikasi</p><p className="mt-1 text-sm text-dark-500 dark:text-slate-400">Aktivitas penting akan muncul di sini.</p></div> : <div className="divide-y divide-dark-50 dark:divide-slate-900">{items.map((item) => <article key={item.id} className={cn("px-5 py-4 transition", item.readAt ? "opacity-75" : "bg-primary/[0.025]")}>
          <div className="flex items-start gap-3"><div className={cn("mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", item.readAt ? "bg-dark-50 text-dark-400 dark:bg-slate-900 dark:text-slate-500" : "bg-primary/10 text-primary")}><Bell className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="font-bold text-dark dark:text-white">{item.title}</h2><p className="mt-1 text-sm leading-6 text-dark-600 dark:text-slate-300">{item.message}</p></div><time className="shrink-0 text-[11px] text-dark-400">{formatDate(item.createdAt)}</time></div><div className="mt-3 flex items-center gap-3">{item.orderId && <Link href={`/admin/orders/${item.orderId}`} className="text-xs font-black text-primary hover:underline">Buka pesanan</Link>}{!item.readAt && <button type="button" onClick={() => void markRead(item.id)} className="inline-flex items-center gap-1.5 text-xs font-bold text-dark-500 hover:text-primary dark:text-slate-400"><CheckCheck className="h-3.5 w-3.5" /> Tandai dibaca</button>}</div></div></div>
        </article>)}</div>}
      </section>
    </div>
  );
}
