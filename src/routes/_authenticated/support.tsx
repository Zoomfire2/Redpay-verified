import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { chatWithSupport, getSupportHistory } from "@/lib/support.functions";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Bot, User as UserIcon, Loader2, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/support")({
  head: () => ({ meta: [{ title: "Support — RedPay" }] }),
  component: Support,
});

function Support() {
  const qc = useQueryClient();
  const fetchHistory = useServerFn(getSupportHistory);
  const send = useServerFn(chatWithSupport);
  const { data: history = [] } = useQuery({ queryKey: ["support-history"], queryFn: () => fetchHistory() });
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const mut = useMutation({
    mutationFn: (message: string) => send({ data: { message } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["support-history"] }); },
    onError: () => {},
  });
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history.length, mut.isPending]);
  useEffect(() => {
    const channel = supabase.channel("support-payment-settings")
      .on("postgres_changes", { event: "*", schema: "public", table: "public_payment_settings", filter: "key=eq.rpc_payment" }, () => {
        void qc.invalidateQueries({ queryKey: ["support-history"] });
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [qc]);

  return (
    <AppShell>
      <header className="p-4 flex items-center gap-3 border-b border-border">
        <Link to="/dashboard"><ArrowLeft className="size-5" /></Link>
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-full gradient-red grid place-items-center"><MessageCircle className="size-4 text-white" /></div>
          <div>
            <p className="font-bold text-sm">RedPay Support</p>
            <p className="text-[10px] text-success">● online</p>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="p-4 space-y-3 max-h-[calc(100vh-14rem)] overflow-y-auto">
        {history.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">
            <Bot className="size-8 text-primary mx-auto mb-2" />
            Ask us anything about your balance, RPC, withdrawals, or referrals.
          </div>
        )}
        {history.map((m: any) => (
          <Bubble key={m.id} sender={m.sender} body={m.body} />
        ))}
        {mut.isPending && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" /> Support is typing…
          </div>
        )}
      </div>

      <form
        onSubmit={e => { e.preventDefault(); if (!text.trim()) return; mut.mutate(text.trim()); setText(""); }}
        className="fixed bottom-16 inset-x-0 max-w-md mx-auto p-3 bg-background border-t border-border flex gap-2"
      >
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Type your message…" className="flex-1 bg-input rounded-full px-4 py-2.5 text-sm outline-none border border-border" />
        <button className="size-10 rounded-full gradient-red grid place-items-center text-white"><Send className="size-4" /></button>
      </form>

      <div className="fixed bottom-32 inset-x-0 max-w-md mx-auto px-3">
        <a href="https://t.me/redpay_support_verified" target="_blank" rel="noopener" className="flex items-center justify-center gap-2 rounded-full gradient-red text-white font-black py-3 shadow-glow hover-scale">
          <MessageCircle className="size-4" /> HUMAN SUPPORT — @redpay_support_verified
        </a>
      </div>
    </AppShell>
  );
}

function Bubble({ sender, body }: { sender: string; body: string }) {
  const isUser = sender === "user";
  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && <div className="size-7 rounded-full gradient-red grid place-items-center shrink-0"><Bot className="size-3.5 text-white" /></div>}
      <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${isUser ? "gradient-red text-white" : "bg-card border border-border"}`}>{body}</div>
      {isUser && <div className="size-7 rounded-full bg-card border border-border grid place-items-center shrink-0"><UserIcon className="size-3.5" /></div>}
    </div>
  );
}
