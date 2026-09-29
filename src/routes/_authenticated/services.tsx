import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ArrowLeft, Phone, Zap, Wifi, Tv, Ticket } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/services")({
  head: () => ({ meta: [{ title: "Services — RedPay" }] }),
  component: Services,
});

function Services() {
  const items = [
    { icon: Phone, label: "Airtime" },
    { icon: Wifi, label: "Data" },
    { icon: Zap, label: "Electricity" },
    { icon: Tv, label: "Cable TV" },
    { icon: Ticket, label: "Betting" },
  ];
  return (
    <AppShell>
      <header className="p-4 flex items-center gap-3">
        <Link to="/dashboard"><ArrowLeft className="size-5" /></Link>
        <h1 className="text-lg font-bold">Services</h1>
      </header>
      <div className="p-4 grid grid-cols-3 gap-3">
        {items.map(({ icon: Icon, label }) => (
          <button key={label} onClick={() => toast.info(`${label} coming soon`)} className="rounded-2xl bg-card border border-border p-4 flex flex-col items-center gap-2">
            <Icon className="size-6 text-primary" />
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>
      <div className="px-4">
        <div className="rounded-2xl bg-primary/10 border border-primary/30 p-4 text-sm text-primary">
          Bill payments will unlock after RPC verification.
        </div>
      </div>
    </AppShell>
  );
}
