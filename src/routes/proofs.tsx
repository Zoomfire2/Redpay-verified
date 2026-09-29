import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/proofs")({
  head: () => ({
    meta: [
      { title: "Payment Proofs — RedPay" },
      { name: "description", content: "Real payment proofs from RedPay users. See what our members have withdrawn." },
    ],
  }),
  component: Proofs,
});

const NAMES = ["Adewole","Chidera","Amaka","Tunde","Blessing","Ifeanyi","Ngozi","Kelechi","Emeka","Chinedu","Bukola","Yemi","Segun","Aisha","Fatima","Musa","Halima","Zainab","Bola","Kunle","Sade","Femi","Toyin","Uche","Obinna","Ada","Nkechi","Titi","Damilola","Wale","Kemi","Rita","Precious","Peace","Joy","Faith","Grace","Mercy","Godwin","Samuel"];
const BANKS = ["OPay","Moniepoint","Access Bank","GTBank","First Bank","UBA","Zenith","Kuda","Palmpay","Wema","Fidelity"];
const AMOUNTS = [100000, 120000, 145000, 160000, 175000, 185000, 190000, 200000, 210000, 235000, 260000, 300000];

const PROOFS = Array.from({ length: 40 }, (_, i) => {
  const name = NAMES[i % NAMES.length];
  const bank = BANKS[(i * 3) % BANKS.length];
  const amount = AMOUNTS[(i * 5) % AMOUNTS.length];
  const day = ((i * 7) % 28) + 1;
  const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i % 12];
  return { id: i, name, bank, amount, date: `${day} ${month}, 2026`, ref: `TRF${(1000000 + i * 71).toString().slice(0, 7)}` };
});

const naira = (n: number) => "₦" + n.toLocaleString();

function Proofs() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="p-4 flex items-center gap-3 border-b border-border">
        <Link to="/"><ArrowLeft className="size-5" /></Link>
        <div>
          <h1 className="text-lg font-bold">Payment Proofs</h1>
          <p className="text-[11px] text-muted-foreground">Verified withdrawals from RedPay members</p>
        </div>
      </header>

      <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {PROOFS.map(p => (
          <div key={p.id} className="rounded-2xl overflow-hidden border border-border bg-card shadow-glow">
            {/* Fake bank alert card */}
            <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border-b border-border">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-emerald-500/20 grid place-items-center">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground tracking-wider">{p.bank} Alert</p>
                  <p className="text-[11px] font-semibold text-emerald-400">Credit Successful</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-[10px] text-muted-foreground">Amount received</p>
                <p className="text-2xl font-black">{naira(p.amount)}</p>
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">
                From: <strong className="text-foreground">REDPAY</strong> · {p.date}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 font-mono">Ref: {p.ref}</div>
            </div>
            <div className="p-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{p.name} • {p.bank}</span>
              <span className="text-primary font-semibold">Verified ✓</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 text-center">
        <Link to="/auth" search={{ mode: "signup" }} className="inline-flex rounded-full gradient-red text-white font-bold px-8 py-3 shadow-glow">
          Join RedPay & get paid too
        </Link>
      </div>
    </div>
  );
}
