import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ArrowLeft, Megaphone } from "lucide-react";

export const Route = createFileRoute("/_authenticated/broadcast")({
  head: () => ({ meta: [{ title: "Broadcast — RedPay" }] }),
  component: Broadcast,
});

function Broadcast() {
  return (
    <AppShell>
      <header className="p-4 flex items-center gap-3">
        <Link to="/dashboard"><ArrowLeft className="size-5" /></Link>
        <h1 className="text-lg font-bold">Broadcast</h1>
      </header>
      <div className="p-4">
        <div className="rounded-3xl bg-card border border-border p-6 text-center">
          <div className="size-14 rounded-full bg-primary/15 grid place-items-center mx-auto"><Megaphone className="size-6 text-primary" /></div>
          <h2 className="mt-4 font-bold">Boost your referrals</h2>
          <p className="text-sm text-muted-foreground mt-1">Send your referral link to hundreds of active earners. Feature unlocks after RPC verification.</p>
        </div>
      </div>
    </AppShell>
  );
}
