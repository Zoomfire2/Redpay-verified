import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyProfile } from "@/lib/redpay.functions";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { ShieldAlert, Lock } from "lucide-react";

export function StatusGate({ children }: { children: React.ReactNode }) {
  const fetchProfile = useServerFn(getMyProfile);
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });
  const nav = useNavigate();

  if (!profile) return <>{children}</>;
  const status = (profile as any).status as string | undefined;
  if (status !== "banned" && status !== "restricted") return <>{children}</>;

  const banned = status === "banned";
  const username = (profile as any).username ?? "user";
  const userId = String((profile as any).id ?? "").slice(0, 8).toUpperCase();
  const reason = (profile as any).status_reason || (banned ? "Severe violation of security policies" : "Suspicious activity detected");
  const date = new Date((profile as any).status_changed_at ?? (profile as any).updated_at ?? Date.now()).toLocaleDateString();

  const suspendMsg = `🔴 REDPAY SECURITY NOTICE

⚠️ ACCOUNT SUSPENDED

Hello ${username},

Your Redpay account has been temporarily suspended due to detected violations of our security policies.

Reason:
🚫 ${reason}

Status:
🔒 Account Access: Restricted
📅 Suspension Date: ${date}
🆔 User ID: ${userId}

Our security system is committed to protecting the Redpay community and preventing unauthorized activities.

If you believe this action was made in error, contact Redpay Support for review.

— REDPAY SECURITY TEAM
🔴 Trusted. Secure. Reliable.`;

  const bannedMsg = `╔════ 🔴 REDPAY SECURITY ════╗

        🚫 ACCOUNT BANNED

Hello ${username},

Your Redpay account has been permanently banned due to severe violation of our security policies.

🆔 User ID: ${userId}
📌 Status: PERMANENTLY BANNED
⚠️ Reason: ${reason}

Access to Redpay services has been revoked.

This action was taken by our automated security system to protect users and maintain platform integrity.

If you believe this decision was incorrect, contact Redpay Support for a review.

╚════ 🔴 REDPAY SECURITY TEAM ════╝`;

  return (
    <div className="min-h-screen bg-background grid place-items-center p-4">
      <div className="max-w-md w-full rounded-3xl border-2 border-red-500/40 bg-card p-6 shadow-glow">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          {banned
            ? <Lock className="size-8 text-red-500" />
            : <ShieldAlert className="size-8 text-red-500" />}
          <div>
            <p className="text-xs uppercase tracking-wider text-red-400 font-semibold">RedPay Security</p>
            <h1 className="text-lg font-black">{banned ? "Account Banned" : "Account Suspended"}</h1>
          </div>
        </div>
        <pre className="mt-4 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-foreground">
{banned ? bannedMsg : suspendMsg}
        </pre>
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
