import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyProfile } from "@/lib/redpay.functions";
import { AppShell, formatNaira } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Share2, Gift, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/refer")({
  head: () => ({ meta: [{ title: "Refer & Earn — RedPay" }] }),
  component: Refer,
});

function Refer() {
  const fetchProfile = useServerFn(getMyProfile);
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });
  const { data: referredCount = 0 } = useQuery({
    queryKey: ["referred-count", profile?.referral_code],
    enabled: !!profile?.referral_code,
    queryFn: async () => {
      const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("referred_by", profile!.referral_code);
      return count ?? 0;
    },
  });
  const code = profile?.referral_code?.toUpperCase() ?? "";
  const link = typeof window !== "undefined" ? `${window.location.origin}/auth?ref=${code}` : "";
  const earnings = referredCount * 5000;

  return (
    <AppShell>
      <header className="p-4 flex items-center gap-3">
        <Link to="/dashboard"><ArrowLeft className="size-5" /></Link>
        <h1 className="text-lg font-bold">Refer & Earn</h1>
      </header>

      <div className="p-4">
        <div className="rounded-3xl gradient-red text-white p-6 text-center shadow-glow">
          <div className="size-14 rounded-full bg-white/15 grid place-items-center mx-auto"><Gift className="size-6" /></div>
          <p className="text-xs opacity-90 mt-3">Earn per referral</p>
          <p className="text-4xl font-black">₦5,000</p>
        </div>

        <div className="mt-4 rounded-2xl bg-card border border-border p-4">
          <p className="text-xs text-muted-foreground">Your referral code</p>
          <div className="mt-2 flex items-center gap-2 rounded-xl bg-background border border-border px-3 py-3">
            <span className="font-mono text-xl tracking-widest flex-1 truncate">{code}</span>
            <button onClick={() => { navigator.clipboard.writeText(code); toast.success("Code copied"); }} className="text-primary"><Copy className="size-4" /></button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => { navigator.clipboard.writeText(link); toast.success("Link copied"); }} className="rounded-full border border-border py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-1"><Copy className="size-4"/> Copy link</button>
            <button onClick={() => {
              if (navigator.share) navigator.share({ title: "Join RedPay", text: "Get ₦98,550 signup bonus", url: link });
              else { navigator.clipboard.writeText(link); toast.success("Link copied"); }
            }} className="rounded-full gradient-red text-white py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-1"><Share2 className="size-4"/> Share</button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Stat label="Total referrals" value={referredCount.toString()} />
          <Stat label="Total earnings" value={formatNaira(earnings)} />
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-lg font-bold mt-1">{value}</p>
    </div>
  );
}
