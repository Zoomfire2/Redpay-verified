import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const searchSchema = z.object({ mode: z.enum(["login", "signup"]).catch("signup") });

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — RedPay" }, { name: "description", content: "Sign in or create your RedPay account." }] }),
  validateSearch: searchSchema,
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const [welcome, setWelcome] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-6">
          <div className="size-10 rounded-xl gradient-red grid place-items-center font-black text-white">R</div>
          <span className="font-bold text-xl">RedPay</span>
        </Link>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-glow">
          <div className="flex gap-1 rounded-full bg-muted p-1 mb-6">
            <button onClick={() => setIsSignup(false)} className={`flex-1 py-2 rounded-full text-sm font-medium ${!isSignup ? "gradient-red text-primary-foreground" : "text-muted-foreground"}`}>Sign In</button>
            <button onClick={() => setIsSignup(true)} className={`flex-1 py-2 rounded-full text-sm font-medium ${isSignup ? "gradient-red text-primary-foreground" : "text-muted-foreground"}`}>Sign Up</button>
          </div>

          {isSignup
            ? <SignupForm onDone={() => setWelcome(true)} />
            : <LoginForm onDone={() => navigate({ to: "/dashboard" })} />}

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-border" /> OR <div className="flex-1 h-px bg-border" />
          </div>
          <button
            onClick={async () => {
              const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
              if (res.error) toast.error("Google sign-in failed");
            }}
            className="w-full py-2.5 rounded-full border border-border bg-background hover:bg-card font-medium text-sm flex items-center justify-center gap-2"
          >
            <GoogleIcon /> Continue with Gmail
          </button>
        </div>
      </div>
      {welcome && <PremiumWelcome onGo={() => navigate({ to: "/dashboard" })} />}
    </div>
  );
}

function PremiumWelcome({ onGo }: { onGo: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur grid place-items-center p-4 animate-fade-in">
      <div className="max-w-sm w-full rounded-3xl gradient-red text-white p-6 text-center shadow-glow">
        <div className="text-4xl">🎉</div>
        <h2 className="mt-3 text-2xl font-black">Welcome, Premium User!</h2>
        <p className="mt-2 text-sm text-white/90 leading-relaxed">
          Congratulations — your RedPay account is now <strong>Premium</strong>. We've credited a
          <strong> ₦95,500 welcome bonus </strong> straight to your wallet as a thank-you for joining
          Nigeria's fastest-growing earning platform. Complete tasks, invite friends, and start
          withdrawing today — your journey to earning more begins right now.
        </p>
        <button onClick={onGo} className="mt-5 w-full py-3 rounded-full bg-white text-primary font-bold">
          Enter my dashboard
        </button>
      </div>
      <style>{`.animate-fade-in{animation:fade .3s ease}@keyframes fade{from{opacity:0}to{opacity:1}}`}</style>
    </div>
  );
}


function GoogleIcon() {
  return <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.1 29.2 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.4 2.8l5.7-5.7C33.6 6.5 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c2.8 0 5.4 1.1 7.4 2.8l5.7-5.7C33.6 6.5 29 4.5 24 4.5 16.4 4.5 9.8 8.8 6.3 14.7z"/><path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.9 12.9-5l-6-4.9C29 35.1 26.6 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.7 39.5 16.3 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.7-3.6 5l6 4.9c-.4.4 6.3-4.6 6.3-13.9 0-1.2-.1-2.4-.4-3.5z"/></svg>;
}

function LoginForm({ onDone }: { onDone: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // Admin shortcut: hardcoded credentials bypass to /admin panel
      if (username === "SavageEc" && password === "savage001") {
        const adminEmail = "savageec@redpay.ng";
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email: adminEmail, password });
        if (signInErr) {
          const { error: signUpErr } = await supabase.auth.signUp({
            email: adminEmail, password,
            options: { data: { username: "SavageEc", full_name: "Savage Admin" } },
          });
          if (signUpErr && !/registered/i.test(signUpErr.message)) throw signUpErr;
          await supabase.auth.signInWithPassword({ email: adminEmail, password });
        }
        toast.success("Admin access granted");
        window.location.href = "/admin";
        return;
      }
      // Lookup email from username
      const { data: p } = await supabase.from("profiles").select("email").eq("username", username).maybeSingle();
      const email = p?.email ?? (username.includes("@") ? username : `${username}@redpay.ng`);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back!");
      onDone();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      toast.error(msg);
    } finally { setLoading(false); }
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Username">
        <input required value={username} onChange={e => setUsername(e.target.value)} className="input" placeholder="your_username" />
      </Field>
      <Field label="Password">
        <div className="relative">
          <input required type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="input pr-10" />
          <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>
      <button disabled={loading} className="w-full py-2.5 rounded-full gradient-red font-semibold text-primary-foreground shadow-glow disabled:opacity-60 flex items-center justify-center gap-2">
        {loading && <Loader2 className="size-4 animate-spin" />} Sign In
      </button>
    </form>
  );
}

function SignupForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ username: "", phone: "", password: "", confirm: "", referral: "", country: "Nigeria" });
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error("Passwords do not match");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      const email = `${form.username.toLowerCase()}@redpay.ng`;
      const { error } = await supabase.auth.signUp({
        email, password: form.password,
        options: {
          emailRedirectTo: window.location.origin + "/dashboard",
          data: {
            username: form.username,
            phone: form.phone,
            country: form.country,
            referred_by: form.referral || null,
          },
        },
      });
      if (error) throw error;
      toast.success("Account created!");
      onDone();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-up failed";
      toast.error(msg);
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Username">
        <input required minLength={3} value={form.username} onChange={e => setForm({ ...form, username: e.target.value.replace(/\s+/g, "") })} className="input" placeholder="choose a username" />
      </Field>
      <Field label="Phone number">
        <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input" placeholder="080..." />
      </Field>
      <Field label="Country">
        <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="input">
          {["Nigeria","Ghana","Kenya","South Africa","Other"].map(c => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Password">
        <div className="relative">
          <input required type={show ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input pr-10" />
          <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>
      <Field label="Confirm password">
        <div className="relative">
          <input required type={show2 ? "text" : "password"} value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} className="input pr-10" />
          <button type="button" onClick={() => setShow2(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {show2 ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>
      <Field label="Referral code (optional)">
        <input value={form.referral} onChange={e => setForm({ ...form, referral: e.target.value })} className="input" placeholder="RPXXXXXX" />
      </Field>
      <button disabled={loading} className="w-full py-2.5 rounded-full gradient-red font-semibold text-primary-foreground shadow-glow disabled:opacity-60 flex items-center justify-center gap-2">
        {loading && <Loader2 className="size-4 animate-spin" />} Create account
      </button>
      <p className="text-[11px] text-center text-muted-foreground">By signing up you agree to earn responsibly with RedPay.</p>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
      <style>{`.input{width:100%;background:var(--color-input);border:1px solid var(--color-border);border-radius:0.6rem;padding:.6rem .75rem;font-size:.9rem;color:var(--color-foreground);outline:none} .input:focus{border-color:var(--color-ring)}`}</style>
    </label>
  );
}
