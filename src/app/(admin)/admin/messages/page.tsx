"use client";

import * as React from "react";
import { Loader2, MessageSquare, Mail, MailOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

type Message = { id: string; content: string; isRead: boolean | null; createdAt: string; senderName: string | null; senderEmail: string | null };

export default function AdminMessagesPage() {
  const { toast } = useToast();
  const [items, setItems] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchData = React.useCallback(async () => { try { const r = await fetch("/api/admin/messages"); const d = await r.json(); if (d.success) setItems(d.messages); } catch {} finally { setIsLoading(false); } }, []);
  React.useEffect(() => {
    void (async () => { await fetchData(); })();
  }, [fetchData]);

  const toggleRead = async (id: string, currentRead: boolean) => {
    await fetch(`/api/admin/messages/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isRead: !currentRead }) });
    toast({ type: "success", title: currentRead ? "Ditandai belum dibaca" : "Ditandai dibaca" });
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return; setIsDeleting(true);
    try { await fetch(`/api/admin/messages/${deleteTarget}`, { method: "DELETE" }); toast({ type: "success", title: "Pesan dihapus" }); fetchData(); } catch {} finally { setIsDeleting(false); setDeleteTarget(null); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-dark">Pesan</h1><p className="mt-1 text-dark-500">{items.length} pesan</p></div>
      <div className="rounded-2xl border border-dark-100 bg-white">
        {isLoading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-dark-400" /></div>
        : items.length > 0 ? (
          <div className="divide-y divide-dark-50">{items.map((m) => (
            <div key={m.id} className={`flex items-start justify-between gap-4 p-5 ${!m.isRead ? "bg-primary/5" : ""}`}>
              <div className="flex gap-3 flex-1">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${!m.isRead ? "bg-primary/20 text-primary" : "bg-dark-100 text-dark-400"}`}>
                  {m.isRead ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-dark">{m.senderName || "Anonim"}</span>
                    {!m.isRead && <Badge variant="default" className="text-[10px]">Baru</Badge>}
                  </div>
                  {m.senderEmail && <p className="text-xs text-dark-400">{m.senderEmail}</p>}
                  <p className="mt-1 text-sm text-dark-600 line-clamp-2">{m.content}</p>
                  <p className="mt-1 text-xs text-dark-400">{formatDate(m.createdAt)}</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" onClick={() => toggleRead(m.id, !!m.isRead)} title={m.isRead ? "Tandai belum dibaca" : "Tandai dibaca"}>
                  {m.isRead ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(m.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
            </div>
          ))}</div>
        ) : <div className="flex flex-col items-center justify-center py-16"><MessageSquare className="h-10 w-10 text-dark-300" /><p className="mt-4 font-semibold text-dark">Belum ada pesan</p></div>}
      </div>
      <ConfirmDialog open={!!deleteTarget} title="Hapus pesan ini?" confirmLabel="Hapus" variant="danger" isLoading={isDeleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
