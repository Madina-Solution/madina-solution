"use client";

import * as React from "react";
import { Send, Loader2, MessageSquare, Headset } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type Msg = {
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

function formatDayLabel(d: string) {
  const date = new Date(d);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  if (isToday) return "Hari ini";
  if (isYesterday) return "Kemarin";
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function AccountMessagesPage() {
  const { toast } = useToast();
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [draft, setDraft] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const hasScrolledInitially = React.useRef(false);

  const fetchMessages = React.useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch("/api/account/messages");
      const data = await res.json();
      if (data.success) setMessages(data.messages);
    } catch {
      if (!silent) toast({ type: "error", title: "Gagal memuat percakapan" });
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void (async () => { await fetchMessages(); })();
    const interval = setInterval(() => void fetchMessages(true), 8000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  React.useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: hasScrolledInitially.current ? "smooth" : "auto" });
      hasScrolledInitially.current = true;
    }
  }, [messages]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!content) return;
    setIsSending(true);
    setDraft("");
    try {
      const res = await fetch("/api/account/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.item]);
      } else {
        toast({ type: "error", title: data.error?.message || "Gagal mengirim pesan" });
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

  const messagesWithDayLabels = React.useMemo(() => {
    return messages.map((m, i) => {
      const dayLabel = formatDayLabel(m.createdAt);
      const prevDayLabel = i > 0 ? formatDayLabel(messages[i - 1].createdAt) : null;
      return { ...m, dayLabel, showDayDivider: dayLabel !== prevDayLabel };
    });
  }, [messages]);

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[480px] flex-col rounded-2xl border border-dark-100 bg-white">
      <div className="flex items-center gap-3 border-b border-dark-100 p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Headset className="h-5 w-5" /></span>
        <div>
          <h2 className="font-semibold text-dark">Chat dengan Tim Kami</h2>
          <p className="text-xs text-dark-500">Biasanya kami membalas dalam beberapa jam pada jam kerja</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {isLoading ? (
          <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-dark-400" /></div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <MessageSquare className="h-10 w-10 text-dark-300" />
            <p className="mt-4 font-semibold text-dark">Belum ada percakapan</p>
            <p className="mt-1 max-w-xs text-sm text-dark-500">Ada pertanyaan tentang pesanan, produk, atau layanan kami? Kirim pesan pertama Anda di bawah ini.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {messagesWithDayLabels.map((m) => {
              const { dayLabel, showDayDivider } = m;
              return (
                <React.Fragment key={m.id}>
                  {showDayDivider && (
                    <div className="my-4 flex items-center justify-center"><span className="rounded-full bg-dark-50 px-3 py-1 text-xs font-medium text-dark-400">{dayLabel}</span></div>
                  )}
                  <div className={cn("flex", m.isMine ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[75%] rounded-2xl px-4 py-2.5", m.isMine ? "rounded-br-sm bg-primary text-white" : "rounded-bl-sm bg-dark-100 text-dark-800")}>
                      {m.orderNumber && <p className={cn("mb-1 text-xs font-semibold", m.isMine ? "text-white/80" : "text-dark-500")}>Terkait pesanan {m.orderNumber}</p>}
                      <p className="whitespace-pre-wrap break-words text-sm">{m.content}</p>
                      <p className={cn("mt-1 text-right text-[10px]", m.isMine ? "text-white/70" : "text-dark-400")}>{formatTime(m.createdAt)}</p>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
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
            placeholder="Tulis pesan Anda..."
            rows={1}
            className="max-h-32 flex-1 resize-none rounded-xl border border-dark-200 bg-white px-4 py-2.5 text-sm text-dark-900 placeholder:text-dark-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={isSending || !draft.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-primary-dark disabled:opacity-40"
            aria-label="Kirim pesan"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
