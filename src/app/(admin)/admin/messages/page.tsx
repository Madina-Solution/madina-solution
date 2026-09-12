"use client";

import * as React from "react";
import { Loader2, MessageSquare, Send, ArrowLeft, Headset } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type Conversation = {
  customerId: string;
  customerName: string;
  customerEmail: string;
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
};

type ThreadMsg = {
  id: string;
  content: string;
  isMine: boolean;
  createdAt: string;
  orderId: string | null;
  orderNumber: string | null;
};

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}
function formatRelative(d: string | null) {
  if (!d) return "";
  const diffMs = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins}m lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}j lalu`;
  const days = Math.floor(hours / 24);
  return `${days}h lalu`;
}

export default function AdminMessagesPage() {
  const { toast } = useToast();
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [isLoadingList, setIsLoadingList] = React.useState(true);
  const [selected, setSelected] = React.useState<Conversation | null>(null);
  const [thread, setThread] = React.useState<ThreadMsg[]>([]);
  const [isLoadingThread, setIsLoadingThread] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  const fetchConversations = React.useCallback(async (silent = false) => {
    if (!silent) setIsLoadingList(true);
    try {
      const res = await fetch("/api/admin/messages");
      const data = await res.json();
      if (data.success) setConversations(data.conversations);
    } catch {
      if (!silent) toast({ type: "error", title: "Gagal memuat daftar percakapan" });
    } finally {
      if (!silent) setIsLoadingList(false);
    }
  }, [toast]);

  const fetchThread = React.useCallback(async (customerId: string, silent = false) => {
    if (!silent) setIsLoadingThread(true);
    try {
      const res = await fetch(`/api/admin/messages?customerId=${customerId}`);
      const data = await res.json();
      if (data.success) setThread(data.messages);
    } catch {
      if (!silent) toast({ type: "error", title: "Gagal memuat percakapan" });
    } finally {
      if (!silent) setIsLoadingThread(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void (async () => { await fetchConversations(); })();
    const interval = setInterval(() => void fetchConversations(true), 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  React.useEffect(() => {
    if (!selected) return;
    void (async () => { await fetchThread(selected.customerId); })();
    const interval = setInterval(() => void fetchThread(selected.customerId, true), 6000);
    return () => clearInterval(interval);
  }, [selected, fetchThread]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  const openConversation = (c: Conversation) => {
    setSelected(c);
    if (c.unreadCount > 0) {
      setConversations((prev) => prev.map((x) => (x.customerId === c.customerId ? { ...x, unreadCount: 0 } : x)));
    }
  };

  const handleSend = async () => {
    if (!selected) return;
    const content = draft.trim();
    if (!content) return;
    setIsSending(true);
    setDraft("");
    try {
      const res = await fetch("/api/admin/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerId: selected.customerId, content }) });
      const data = await res.json();
      if (data.success) {
        setThread((prev) => [...prev, data.item]);
        void fetchConversations(true);
      } else {
        toast({ type: "error", title: data.error?.message || "Gagal mengirim balasan" });
        setDraft(content);
      }
    } catch {
      toast({ type: "error", title: "Terjadi kesalahan" });
      setDraft(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-dark">Pesan</h1><p className="mt-1 text-dark-500">Percakapan dengan pelanggan</p></div>

      <div className="grid overflow-hidden rounded-2xl border border-dark-100 bg-white lg:grid-cols-[320px_1fr]" style={{ height: "calc(100vh - 240px)", minHeight: 480 }}>
        {/* Conversation list */}
        <div className={cn("flex-col border-dark-100 lg:flex lg:border-r", selected ? "hidden lg:flex" : "flex")}>
          <div className="overflow-y-auto">
            {isLoadingList ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-dark-400" /></div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <MessageSquare className="h-10 w-10 text-dark-300" />
                <p className="mt-4 font-semibold text-dark">Belum ada pesan</p>
                <p className="mt-1 text-sm text-dark-500">Pesan dari pelanggan akan muncul di sini.</p>
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.customerId}
                  onClick={() => openConversation(c)}
                  className={cn("flex w-full items-start gap-3 border-b border-dark-50 p-4 text-left transition-colors hover:bg-dark-50", selected?.customerId === c.customerId && "bg-primary/5")}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{c.customerName.charAt(0).toUpperCase()}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-dark">{c.customerName}</span>
                      <span className="shrink-0 text-xs text-dark-400">{formatRelative(c.lastMessageAt)}</span>
                    </div>
                    <p className="truncate text-xs text-dark-500">{c.lastMessage}</p>
                  </div>
                  {c.unreadCount > 0 && <span className="mt-1 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">{c.unreadCount}</span>}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Thread */}
        <div className={cn("flex-col", selected ? "flex" : "hidden lg:flex")}>
          {!selected ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Headset className="h-10 w-10 text-dark-300" />
              <p className="mt-4 font-semibold text-dark">Pilih percakapan</p>
              <p className="mt-1 text-sm text-dark-500">Pilih pelanggan di kiri untuk melihat & membalas pesan.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-dark-100 p-4">
                <button className="rounded-lg p-1 text-dark-500 hover:bg-dark-100 lg:hidden" onClick={() => setSelected(null)}><ArrowLeft className="h-5 w-5" /></button>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{selected.customerName.charAt(0).toUpperCase()}</span>
                <div className="min-w-0"><p className="truncate font-semibold text-dark">{selected.customerName}</p><p className="truncate text-xs text-dark-400">{selected.customerEmail}</p></div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {isLoadingThread ? (
                  <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-dark-400" /></div>
                ) : (
                  <div className="space-y-2">
                    {thread.map((m) => (
                      <div key={m.id} className={cn("flex", m.isMine ? "justify-end" : "justify-start")}>
                        <div className={cn("max-w-[75%] rounded-2xl px-4 py-2.5", m.isMine ? "rounded-br-sm bg-primary text-white" : "rounded-bl-sm bg-dark-100 text-dark-800")}>
                          {m.orderNumber && <p className={cn("mb-1 text-xs font-semibold", m.isMine ? "text-white/80" : "text-dark-500")}>Terkait pesanan {m.orderNumber}</p>}
                          <p className="whitespace-pre-wrap break-words text-sm">{m.content}</p>
                          <p className={cn("mt-1 text-right text-[10px]", m.isMine ? "text-white/70" : "text-dark-400")}>{formatTime(m.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>
              <div className="border-t border-dark-100 p-4">
                <div className="flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Tulis balasan..."
                    rows={1}
                    className="max-h-32 flex-1 resize-none rounded-xl border border-dark-200 bg-white px-4 py-2.5 text-sm text-dark-900 placeholder:text-dark-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={isSending || !draft.trim()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-primary-dark disabled:opacity-40"
                    aria-label="Kirim balasan"
                  >
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
