import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyProfile } from "@/lib/redpay.functions";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { ShieldAlert, Lock } from "lucide-react";

export function StatusGate({ children }: { children: React.ReactNode }) {
  const fetchProfile = useServerFn(getMyProfile);
  const qc = useQueryClient();
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });
  const nav = useNavigate();
  const uid = (profile as any)?.id as string | undefined;
  const status = (profile as any)?.status as string | undefined;

  // Live updates: status and balance changes made by admins apply instantly.
  useEffect(() => {
    if (!uid) return;
    const channel = supabase
      .channel(`profile-${uid}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${uid}` },
        (payload) => {
          qc.setQueryData(["profile"], (old: any) => ({ ...(old ?? {}), ...(payload.new as any) }));
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [uid, qc]);

  // Activity heartbeat (real last-seen data for the admin panel).
  useEffect(() => {
    if (!uid || status !== "active") return;
    const beat = () => { supabase.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", uid).then(() => {}); };
    beat();
    const t = setInterval(beat, 60_000);
    return () => clearInterval(t);
  }, [uid, status]);

  if (!profile) return <>{children}</>;
  if (status !== "banned" && status !== "restricted") return <>{children}</>;

  const banned = status === "banned";
  const userId = String((profile as any).id ?? "").slice(0, 8).toUpperCase();
  const reason = (profile as any).status_reason as string | null;

  return (
    <div className="min-h-screen bg-background grid place-items-center p-4">
      <div className="max-w-md w-full rounded-3xl border-2 border-red-500/40 bg-card p-6 shadow-glow">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          {banned ? <Lock className="size-8 text-red-500" /> : <ShieldAlert className="size-8 text-red-500" />}
          <div>
            <p className="text-xs uppercase tracking-wider text-red-400 font-semibold">RedPay Security</p>
            <h1 className="text-lg font-black">{banned ? "Account Banned" : "Account Suspended"}</h1>
          </div>
        </div>
        <p className="mt-5 text-base font-semibold leading-relaxed">
          {banned
            ? "You have been permanently banned from using our system."
            : "Your account has been temporarily suspended from our system for a short while."}
        </p>
        <div className="mt-4 space-y-1 text-xs text-muted-foreground">
          <p>Status: <span className="font-black text-red-400">{banned ? "BANNED" : "SUSPENDED"}</span></p>
          <p>User ID: <span className="font-mono">{userId}</span></p>
          {reason && <p>Reason: {reason}</p>}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <a href="https://t.me/redpay_support_" target="_blank" rel="noreferrer"
             className="py-2.5 rounded-full gradient-red text-white text-sm font-bold text-center">
            Contact Support
          </a>
          <button
            onClick={async () => { await supabase.auth.signOut(); nav({ to: "/" }); }}
            className="py-2.5 rounded-full border border-border bg-background text-sm font-semibold">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
