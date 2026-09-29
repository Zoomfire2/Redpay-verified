import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AppShell, formatNaira } from "@/components/app-shell";
import { BroadcastBanner } from "@/components/broadcast-banner";
import { getMyProfile, claimBonus } from "@/lib/redpay.functions";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Bell, LogOut, Wallet, Gift, Users, ListTodo, Radio, Phone, Zap, Copy, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — RedPay" }] }),
  component: Dashboard,
});

function Dashboard() {
  const fetchProfile = useServerFn(getMyProfile);
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });
  const doClaim = useServerFn(claimBonus);
  const claimMut = useMutation({
    mutationFn: () => doClaim(),
    onSuccess: (res) => {
      if (res.ok) { toast.success(`Claimed ${formatNaira(res.amount)}`); qc.invalidateQueries({ queryKey: ["profile"] }); }
      else { const mins = Math.ceil((res.remainMs ?? 0) / 60000); toast.info(`Next claim in ${mins} min`); }
    },
    onError: () => toast.error("Claim failed"),
  });
  const nav = useNavigate();

  return (
    <AppShell>
      <BroadcastBanner />
      {/* Warning banner */}
      <div className="bg-yellow-500/15 border-b border-yellow-500/30 px-4 py-2 text-[11px] text-yellow-300 flex items-start gap-2">
        <AlertTriangle className="size-4 shrink-0 mt-0.5" />
        <span>Beware of fake versions of RedPay. Only trust <strong>official channels</strong> and never share your password.</span>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full gradient-red grid place-items-center font-black text-white">
            {(profile?.username?.[0] ?? "R").toUpperCase()}
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Welcome back</p>
            <p className="font-semibold text-sm">@{profile?.username ?? "user"}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="size-9 rounded-full bg-card grid place-items-center"><Bell className="size-4" /></button>
          <button onClick={async () => { await supabase.auth.signOut(); nav({ to: "/" }); }} className="size-9 rounded-full bg-card grid place-items-center"><LogOut className="size-4" /></button>
        </div>
      </header>

      {/* Balance card */}
      <section className="px-4">
        <div className="rounded-3xl gradient-red p-5 shadow-glow text-white">
          <div className="flex items-center justify-between text-xs opacity-90">
            <span className="inline-flex items-center gap-1"><Wallet className="size-3.5" /> Available balance</span>
            <span className="inline-flex items-center gap-1"><Radio className="size-3.5 animate-pulse" /> LIVE</span>
          </div>
          <div className="mt-2 text-4xl font-black tracking-tight">
            {isLoading ? "..." : formatNaira(profile?.balance)}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={() => claimMut.mutate()} disabled={claimMut.isPending} className="rounded-full bg-white/15 backdrop-blur border border-white/25 py-2.5 font-semibold text-sm">
              {claimMut.isPending ? "Claiming..." : "Claim ₦4,000"}
            </button>
            <Link to="/withdraw" className="rounded-full bg-white text-primary py-2.5 font-semibold text-sm text-center">Withdraw</Link>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="px-4 mt-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick actions</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Zap, label: "Buy RPC", to: "/rpc" as const },
            { icon: ListTodo, label: "Tasks", to: "/tasks" as const },
            { icon: Users, label: "Refer", to: "/refer" as const },
            { icon: Radio, label: "Broadcast", to: "/broadcast" as const },
            { icon: Phone, label: "Airtime", to: "/services" as const },
            { icon: Wallet, label: "Bills", to: "/services" as const },
            { icon: Gift, label: "Bonus", to: "/dashboard" as const },
            { icon: Send, label: "Send", to: "/services" as const },
          ].map((a) => (
            <Link key={a.label} to={a.to} className="flex flex-col items-center gap-1.5">
              <div className="size-14 rounded-2xl bg-card border border-border grid place-items-center">
                <a.icon className="size-5 text-primary" />
              </div>
              <span className="text-[10px] text-muted-foreground">{a.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Live earners ticker */}
      <section className="px-4 mt-6">
        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live earners</p>
            <span className="text-[10px] text-success">● LIVE</span>
          </div>
          <ul className="space-y-2 text-sm">
            {[
              ["Chidera O.", 185000, "withdrew"],
              ["Amaka T.", 4000, "claimed"],
              ["Tunde B.", 12300, "earned"],
              ["Blessing K.", 950, "earned"],
              ["Ifeanyi A.", 100000, "withdrew"],
            ].map(([name, amt, verb]) => (
              <li key={name as string} className="flex items-center justify-between">
                <span className="text-muted-foreground"><strong className="text-foreground">{name}</strong> {verb}</span>
                <span className="font-semibold text-primary">{formatNaira(amt as number)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Referral compact */}
      <section className="px-4 mt-6 mb-4">
        <ReferralPreview code={profile?.referral_code ?? ""} />
      </section>
    </AppShell>
  );
}

function ReferralPreview({ code }: { code: string }) {
  const link = typeof window !== "undefined" ? `${window.location.origin}/auth?ref=${code}` : "";
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="size-11 rounded-xl bg-primary/15 grid place-items-center"><Gift className="size-5 text-primary" /></div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Earn ₦5,000 per referral</p>
          <p className="text-xs text-muted-foreground">Share your code and get paid instantly.</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-background border border-border px-3 py-2">
        <span className="font-mono text-sm tracking-widest flex-1 truncate">{code.toUpperCase()}</span>
        <button onClick={() => { navigator.clipboard.writeText(link); toast.success("Referral link copied"); }} className="text-primary text-xs font-semibold inline-flex items-center gap-1">
          <Copy className="size-3.5" /> Copy
        </button>
      </div>
    </div>
  );
}
