import { Link, useLocation } from "@tanstack/react-router";
import { Home, ListTodo, Wallet, MessageCircle, Users } from "lucide-react";

const items = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/tasks", label: "Tasks", icon: ListTodo },
  { to: "/withdraw", label: "Cash Out", icon: Wallet },
  { to: "/refer", label: "Refer", icon: Users },
  { to: "/support", label: "Support", icon: MessageCircle },
];

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur">
      <div className="max-w-md mx-auto grid grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <Link key={to} to={to} className={`py-2.5 flex flex-col items-center gap-1 text-[10px] ${active ? "text-primary" : "text-muted-foreground"}`}>
              <Icon className="size-5" /> {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto">{children}</div>
      <BottomNav />
    </div>
  );
}

export function formatNaira(n: number | string | null | undefined) {
  const v = typeof n === "string" ? Number(n) : n ?? 0;
  return "₦" + (v || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}
