import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Wallet, Users, Zap, Shield, TrendingUp, Star, Download, Smartphone } from "lucide-react";
import ndicBadge from "@/assets/ndic-badge.png";
import cbnBadge from "@/assets/cbn-badge.png";
import redpayApk from "@/assets/redpay-apk.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RedPay — Earn Live. Withdraw Faster." },
      { name: "description", content: "Welcome to RedPay Earn Live. Complete tasks, refer friends, unlock daily bonuses and enjoy fast withdrawals to your bank." },
      { property: "og:title", content: "RedPay — Earn Live. Withdraw Faster." },
      { property: "og:description", content: "Welcome to RedPay Earn Live. Complete tasks, refer friends, unlock daily bonuses and enjoy fast withdrawals to your bank." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Ticker */}
      <div className="bg-primary/90 text-primary-foreground text-xs py-2 overflow-hidden">
        <div className="whitespace-nowrap animate-ticker inline-block">
          {"🔴 LIVE PAYOUTS  •  Chidera withdrew ₦185,000  •  Amaka just claimed her bonus  •  Tunde earned ₦12,300 today  •  Blessing joined 2 minutes ago  •  RedPay Earn Live  •  ".repeat(6)}
        </div>
      </div>

      <header className="max-w-6xl mx-auto flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-xl gradient-red grid place-items-center font-black text-white">R</div>
          <span className="font-bold text-lg tracking-tight">RedPay</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/auth" search={{ mode: "login" }} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">Sign In</Link>
          <Link to="/auth" search={{ mode: "signup" }} className="px-4 py-1.5 rounded-full gradient-red text-sm font-semibold text-primary-foreground shadow-glow">Sign Up</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-8 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary mb-6">
          <Sparkles className="size-3" /> 🔴 Welcome to RedPay Earn Live
        </div>
        <h1 className="text-4xl sm:text-6xl font-black leading-[1.05] tracking-tight">
          Earn More. Withdraw Faster.
          <br />
          <span className="text-gradient bg-clip-text text-transparent gradient-red">Grow Smarter.</span>
        </h1>
        <p className="mt-6 max-w-xl mx-auto text-muted-foreground text-lg">
          Turn your free time into real rewards with RedPay — complete tasks, refer friends, unlock bonuses, and enjoy fast withdrawals.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/auth" search={{ mode: "signup" }} className="rounded-full gradient-red px-8 py-3.5 font-semibold text-primary-foreground shadow-glow">
            Start
          </Link>
          <Link to="/auth" search={{ mode: "login" }} className="rounded-full border border-border px-8 py-3.5 font-semibold hover:bg-card">
            Log In
          </Link>
          <Link to="/proofs" className="rounded-full border border-border px-8 py-3.5 font-semibold hover:bg-card">
            Proofs
          </Link>
        </div>

        {/* Regulatory verification */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-1 animate-fade-in">
            <img src={ndicBadge} alt="NDIC Insured" width={96} height={96} loading="lazy" className="size-20 sm:size-24 drop-shadow-[0_6px_18px_rgba(34,197,94,0.35)] hover-scale" />
            <span className="text-[10px] uppercase tracking-wider text-success font-bold">NDIC Insured</span>
          </div>
          <div className="flex flex-col items-center gap-1 animate-fade-in">
            <img src={cbnBadge} alt="CBN Licensed" width={96} height={96} loading="lazy" className="size-20 sm:size-24 drop-shadow-[0_6px_18px_rgba(34,197,94,0.35)] hover-scale" />
            <span className="text-[10px] uppercase tracking-wider text-success font-bold">CBN Licensed</span>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
          {["✔️ Trusted Platform","🔒 Secure Transactions","⚡ Fast Payouts","🎧 24/7 Customer Support"].map(t => (
            <span key={t} className="rounded-full border border-border bg-card px-3 py-1.5">{t}</span>
          ))}
        </div>
      </section>

      {/* APK Download */}
      <section className="max-w-3xl mx-auto px-5 pb-16">
        <a
          href={redpayApk.url}
          download="RedPay-v2.1.2.apk"
          className="group relative flex items-center gap-4 rounded-3xl border border-primary/40 bg-gradient-to-br from-card via-card to-primary/10 p-5 shadow-glow overflow-hidden hover-scale"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity gradient-red/10" />
          <div className="relative size-14 rounded-2xl gradient-red grid place-items-center shrink-0 shadow-glow">
            <Smartphone className="size-7 text-white" />
          </div>
          <div className="relative flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider font-bold text-success bg-success/15 px-2 py-0.5 rounded-full">✔️ Verified APK</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">v2.1.2 · 6.2 MB</span>
            </div>
            <h3 className="mt-1 font-black text-base sm:text-lg leading-tight">Download the RedPay App Today</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Faster payouts, instant claims & offline task tracking on Android.</p>
          </div>
          <div className="relative shrink-0 flex items-center gap-1.5 rounded-full gradient-red px-4 py-2.5 font-semibold text-primary-foreground text-sm shadow-glow">
            <Download className="size-4" /> APK
          </div>
        </a>
      </section>


      {/* Features */}
      <section className="max-w-6xl mx-auto px-5 pb-16">
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-8">⭐ Why Thousands Choose RedPay</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { i: Wallet, t: "✅ High-paying daily tasks", d: "Simple daily tasks that pay real money — every day." },
          { i: Zap, t: "🎁 Daily bonuses & campaigns", d: "Come back every day for special rewards and campaigns." },
          { i: Users, t: "👥 Rewarding referral program", d: "Invite friends and earn generously with every signup." },
          { i: TrendingUp, t: "⚡ Fast, seamless withdrawals", d: "Cash out to your bank without delays or stress." },
          { i: Shield, t: "🔒 Secure with account protection", d: "Bank-grade security keeps your earnings and data safe." },
          { i: Star, t: "📱 Simple, modern, easy to use", d: "Built for anyone — smooth on any phone, any time." },
        ].map(({ i: Icon, t, d }) => (
          <div key={t} className="rounded-2xl border border-border bg-card p-5">
            <div className="size-10 rounded-xl bg-primary/15 grid place-items-center mb-3">
              <Icon className="size-5 text-primary" />
            </div>
            <h3 className="font-semibold">{t}</h3>
            <p className="text-sm text-muted-foreground mt-1">{d}</p>
          </div>
        ))}
        </div>
        <p className="mt-8 text-center text-muted-foreground max-w-2xl mx-auto">
          Whether you're a student, freelancer, or looking for extra income, RedPay gives you more opportunities to earn every day.
        </p>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-5 pb-20 text-center">
        <div className="rounded-3xl gradient-red p-8 shadow-glow">
          <h2 className="text-2xl sm:text-3xl font-black text-white">🚀 Join RedPay Today</h2>
          <p className="text-white/85 mt-2">Complete tasks. Invite friends. Earn more. Withdraw with ease. Your next payout starts with your first task!</p>
          <Link to="/auth" search={{ mode: "signup" }} className="mt-6 inline-flex rounded-full bg-white text-primary font-bold px-8 py-3">
            Start Earning
          </Link>
        </div>
        <footer className="mt-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} RedPay Nigeria. All rights reserved.
        </footer>
      </section>
    </div>
  );
}
