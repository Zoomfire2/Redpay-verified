import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import {
  adminLogin, adminStats, adminListUsers, adminUpdateUser, adminListWithdrawals, adminListIntakes,
  adminUpdatePayment, adminAddTask, adminRemoveTask, adminAdjustBalance,
  adminBroadcast, adminDeleteBroadcast, adminListBroadcasts, adminListRpcReceipts,
} from "@/lib/admin.functions";
import { toast } from "sonner";
import { Shield, Users, Wallet, Zap, LogOut, Loader2, Trash2, Radio, Settings, ListTodo } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — RedPay" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

function AdminPage() {
  const [checked, setChecked] = useState(false);
  const [session, setSession] = useState<any>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setChecked(true); });
  }, []);
  if (!checked) return <div className="min-h-screen grid place-items-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;
  if (!session) return <SigninPrompt />;
  return <AdminGate />;
}

function SigninPrompt() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <div>
        <Shield className="size-10 mx-auto text-primary" />
        <p className="mt-3 font-semibold">Admin access requires an authenticated account.</p>
        <button onClick={() => nav({ to: "/auth", search: { mode: "login" } })} className="mt-4 rounded-full gradient-red px-6 py-2.5 text-white font-semibold">Sign in first</button>
      </div>
    </div>
  );
}

function AdminGate() {
  const [authed, setAuthed] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const login = useServerFn(adminLogin);
  const mut = useMutation({
    mutationFn: () => login({ data: form }),
    onSuccess: (r) => { if (r.ok) { toast.success("Admin unlocked"); setAuthed(true); } else toast.error("Invalid credentials"); },
  });

  if (authed) return <AdminDashboard />;
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={e => { e.preventDefault(); mut.mutate(); }} className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-glow">
        <div className="flex items-center gap-2 mb-4"><Shield className="size-5 text-primary" /><h1 className="font-bold text-lg">Admin login</h1></div>
        <label className="text-xs text-muted-foreground">Username</label>
        <input required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="w-full input mb-3" />
        <label className="text-xs text-muted-foreground">Password</label>
        <input required type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full input mb-4" />
        <button disabled={mut.isPending} className="w-full py-2.5 rounded-full gradient-red text-white font-semibold">{mut.isPending ? "Checking…" : "Unlock admin"}</button>
        <style>{`.input{background:var(--color-input);border:1px solid var(--color-border);border-radius:0.6rem;padding:.55rem .75rem;font-size:.9rem;margin-top:.25rem;color:var(--color-foreground);outline:none}`}</style>
      </form>
    </div>
  );
}

type Tab = "users" | "withdrawals" | "intakes" | "tasks" | "payment" | "broadcast" | "receipts";

function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("users");
  const stats = useServerFn(adminStats);
  const { data: s } = useQuery({ queryKey: ["admin-stats"], queryFn: () => stats() });
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-2"><Shield className="size-5 text-primary" /><h1 className="font-bold">RedPay Admin</h1></div>
        <button onClick={async () => { await supabase.auth.signOut(); nav({ to: "/" }); }} className="text-xs inline-flex items-center gap-1"><LogOut className="size-3" /> Logout</button>
      </header>
      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Users" value={s?.users ?? 0} />
        <StatCard icon={Wallet} label="Withdrawals" value={s?.withdrawals ?? 0} />
        <StatCard icon={Zap} label="RPC intakes" value={s?.intakes ?? 0} />
        <StatCard icon={ListTodo} label="Task completions" value={s?.completions ?? 0} />
      </div>

      <div className="px-4 border-b border-border overflow-x-auto">
        <div className="flex gap-4 text-sm min-w-max">
          {([
            ["users", Users], ["withdrawals", Wallet], ["intakes", Zap],
            ["tasks", ListTodo], ["payment", Settings], ["broadcast", Radio], ["receipts", Wallet],
          ] as [Tab, any][]).map(([t, Icon]) => (
            <button key={t} onClick={() => setTab(t)} className={`py-3 border-b-2 inline-flex items-center gap-1 ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
              <Icon className="size-3.5" /> {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {tab === "users" && <UsersTab />}
        {tab === "withdrawals" && <WithdrawalsTab />}
        {tab === "intakes" && <IntakesTab />}
        {tab === "tasks" && <TasksTab />}
        {tab === "payment" && <PaymentTab />}
        {tab === "broadcast" && <BroadcastTab />}
        {tab === "receipts" && <RpcReceiptsTab />}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: any) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <Icon className="size-4 text-primary" />
      <p className="text-[10px] text-muted-foreground uppercase mt-2">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

function UsersTab() {
  const qc = useQueryClient();
  const list = useServerFn(adminListUsers);
  const update = useServerFn(adminUpdateUser);
  const adjust = useServerFn(adminAdjustBalance);
  const broadcast = useServerFn(adminBroadcast);
  const { data: users = [] } = useQuery({ queryKey: ["admin-users"], queryFn: () => list() });
  const setMut = useMutation({
    mutationFn: (v: { userId: string; balance?: number; status?: string; status_reason?: string | null }) => update({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Updated"); },
  });
  const adjMut = useMutation({
    mutationFn: (v: { userId: string; delta: number }) => adjust({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Balance adjusted"); },
  });
  const bcMut = useMutation({
    mutationFn: (v: { title: string; body: string; target_user_id: string }) => broadcast({ data: v }),
    onSuccess: () => toast.success("Sent to user"),
  });

  function changeStatus(u: any, next: string) {
    if (next === "active") { setMut.mutate({ userId: u.id, status: "active", status_reason: null }); return; }
    const label = next === "banned" ? "ban" : "suspension";
    const reason = prompt(`Reason for ${label} (shown to user):`, next === "banned" ? "Severe violation of platform rules" : "Suspicious activity detected");
    if (reason === null) return;
    setMut.mutate({ userId: u.id, status: next, status_reason: reason });
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground bg-background/50">
          <tr>{["Username","Phone","Country","Balance","Status","Actions"].map(h => <th key={h} className="text-left px-3 py-2">{h}</th>)}</tr>
        </thead>
        <tbody>
          {users.map((u: any) => (
            <tr key={u.id} className="border-t border-border">
              <td className="px-3 py-2 font-semibold">@{u.username}</td>
              <td className="px-3 py-2 text-muted-foreground">{u.phone}</td>
              <td className="px-3 py-2 text-muted-foreground">{u.country}</td>
              <td className="px-3 py-2">₦{Number(u.balance).toLocaleString()}</td>
              <td className="px-3 py-2">
                <select value={u.status ?? "active"} onChange={e => changeStatus(u, e.target.value)} className="bg-input rounded px-2 py-1 text-xs border border-border">
                  <option value="active">active</option>
                  <option value="restricted">suspended</option>
                  <option value="banned">banned</option>
                </select>
              </td>
              <td className="px-3 py-2 space-x-2 whitespace-nowrap">
                <button onClick={() => {
                  const v = prompt("Set new balance (₦):", String(u.balance));
                  if (v && !isNaN(Number(v))) setMut.mutate({ userId: u.id, balance: Number(v) });
                }} className="text-primary text-xs">Set</button>
                <button onClick={() => {
                  const v = prompt("Add amount (₦):", "1000");
                  if (v && !isNaN(Number(v))) adjMut.mutate({ userId: u.id, delta: Number(v) });
                }} className="text-emerald-400 text-xs">+Add</button>
                <button onClick={() => {
                  const v = prompt("Deduct amount (₦):", "1000");
                  if (v && !isNaN(Number(v))) adjMut.mutate({ userId: u.id, delta: -Number(v) });
                }} className="text-red-400 text-xs">-Deduct</button>
                <button onClick={() => {
                  const title = prompt(`Message title to @${u.username}:`, "Message from RedPay");
                  if (!title) return;
                  const body = prompt("Message body:", "");
                  if (!body) return;
                  bcMut.mutate({ title, body, target_user_id: u.id });
                }} className="text-blue-400 text-xs">Message</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WithdrawalsTab() {
  const list = useServerFn(adminListWithdrawals);
  const { data = [] } = useQuery({ queryKey: ["admin-w"], queryFn: () => list() });
  return (
    <div className="rounded-2xl border border-border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground bg-background/50"><tr>
          {["When","Amount","Bank","Account","RPC tried"].map(h => <th key={h} className="text-left px-3 py-2">{h}</th>)}
        </tr></thead>
        <tbody>
          {data.map((w: any) => (
            <tr key={w.id} className="border-t border-border">
              <td className="px-3 py-2 text-xs">{new Date(w.created_at).toLocaleString()}</td>
              <td className="px-3 py-2 font-semibold">₦{Number(w.amount).toLocaleString()}</td>
              <td className="px-3 py-2">{w.bank}</td>
              <td className="px-3 py-2 text-xs">{w.account_name} / {w.account_number}</td>
              <td className="px-3 py-2 font-mono text-xs">{w.rpc_tried}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IntakesTab() {
  const list = useServerFn(adminListIntakes);
  const { data = [] } = useQuery({ queryKey: ["admin-i"], queryFn: () => list() });
  return (
    <div className="rounded-2xl border border-border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground bg-background/50"><tr>
          {["When","Email","Phone"].map(h => <th key={h} className="text-left px-3 py-2">{h}</th>)}
        </tr></thead>
        <tbody>
          {data.map((r: any) => (
            <tr key={r.id} className="border-t border-border">
              <td className="px-3 py-2 text-xs">{new Date(r.created_at).toLocaleString()}</td>
              <td className="px-3 py-2">{r.email}</td>
              <td className="px-3 py-2">{r.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TasksTab() {
  const qc = useQueryClient();
  const { data: tasks = [] } = useQuery({
    queryKey: ["admin-tasks"],
    queryFn: async () => (await supabase.from("tasks").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const add = useServerFn(adminAddTask);
  const remove = useServerFn(adminRemoveTask);
  const [form, setForm] = useState({ title: "", platform: "WhatsApp Channel", url: "", reward: 950 });
  const addMut = useMutation({
    mutationFn: () => add({ data: form }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tasks"] }); setForm({ title: "", platform: "WhatsApp Channel", url: "", reward: 950 }); toast.success("Task added"); },
  });
  const rmMut = useMutation({
    mutationFn: (id: string) => remove({ data: { taskId: id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tasks"] }); toast.success("Removed"); },
  });

  return (
    <div className="space-y-4">
      <form onSubmit={e => { e.preventDefault(); addMut.mutate(); }} className="rounded-2xl border border-border bg-card p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase">Add task</p>
        <input required placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input w-full" />
        <div className="grid grid-cols-2 gap-2">
          <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className="input">
            <option>WhatsApp Channel</option><option>Telegram</option><option>YouTube</option><option>Instagram</option>
          </select>
          <input type="number" placeholder="Reward" value={form.reward} onChange={e => setForm({ ...form, reward: Number(e.target.value) })} className="input" />
        </div>
        <input required placeholder="URL" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} className="input w-full" />
        <button className="w-full py-2 rounded-full gradient-red text-white text-sm font-semibold">Add task</button>
        <StyleTag />
      </form>

      <div className="rounded-2xl border border-border bg-card divide-y divide-border max-h-[500px] overflow-y-auto">
        {tasks.map((t: any) => (
          <div key={t.id} className="p-3 flex items-center gap-2 text-sm">
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{t.title}</p>
              <p className="text-[11px] text-muted-foreground truncate">{t.platform} · {t.url}</p>
            </div>
            <span className="text-xs text-primary font-semibold">₦{Number(t.reward).toLocaleString()}</span>
            <button onClick={() => { if (confirm("Delete task?")) rmMut.mutate(t.id); }} className="text-red-400"><Trash2 className="size-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentTab() {
  const { data: current } = useQuery({
    queryKey: ["rpc_payment_admin"],
    queryFn: async () => (await supabase.from("public_payment_settings").select("bank,account_name,account_number,amount,original_amount,instructions,payment_mode").eq("key", "rpc_payment").maybeSingle()).data as any,
  });
  const [form, setForm] = useState<any>({ bank: "", account_number: "", account_name: "", amount: 0, original_amount: "", instructions: "", payment_mode: "normal" });
  useEffect(() => { if (current) setForm(current); }, [current]);
  const update = useServerFn(adminUpdatePayment);
  const mut = useMutation({
    mutationFn: () => update({ data: {
      bank: form.bank, account_number: form.account_number, account_name: form.account_name,
      amount: Number(form.amount), original_amount: Number(form.original_amount ?? 0) || undefined,
      instructions: form.instructions || null, payment_mode: form.payment_mode,
    }}),
    onSuccess: () => toast.success("Payment details updated"),
  });

  return (
    <form onSubmit={e => { e.preventDefault(); mut.mutate(); }} className="rounded-2xl border border-border bg-card p-4 space-y-2 max-w-md">
      <p className="text-xs font-semibold text-muted-foreground uppercase">RPC payment destination</p>
      <label className="text-xs text-muted-foreground">Active payment option</label>
      <select className="input w-full" value={form.payment_mode} onChange={e => setForm({ ...form, payment_mode: e.target.value })}>
        <option value="normal">Normal Payment Option</option>
        <option value="flutterwave">Flutterwave Payment Link</option>
      </select>
      {form.payment_mode === "flutterwave" && <div className="rounded-md border border-border p-3 text-sm space-y-1">
        <p className="font-semibold">Flutterwave checkout</p>
        <a className="text-primary underline break-all" href="https://flutterwave.com/pay/buyrpc" target="_blank" rel="noreferrer">https://flutterwave.com/pay/buyrpc</a>
        <p className="text-xs text-muted-foreground">Configure the payment link to return customers to this site's /rpc page after checkout.</p>
      </div>}
      <label className="text-xs text-muted-foreground">Bank</label>
      <input className="input w-full" value={form.bank} onChange={e => setForm({ ...form, bank: e.target.value })} />
      <label className="text-xs text-muted-foreground">Account number</label>
      <input className="input w-full" value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })} />
      <label className="text-xs text-muted-foreground">Account name</label>
      <input className="input w-full" value={form.account_name} onChange={e => setForm({ ...form, account_name: e.target.value })} />
      <label className="text-xs text-muted-foreground">Payment instructions</label>
      <textarea className="input w-full" rows={3} value={form.instructions ?? ""} onChange={e => setForm({ ...form, instructions: e.target.value })} />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground">Amount (₦)</label>
          <input type="number" className="input w-full" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Original (strike)</label>
          <input type="number" className="input w-full" value={form.original_amount ?? ""} onChange={e => setForm({ ...form, original_amount: e.target.value })} />
        </div>
      </div>
      <button className="w-full py-2.5 rounded-full gradient-red text-white text-sm font-semibold mt-2">Save payment settings</button>
      <StyleTag />
    </form>
  );
}

function RpcReceiptsTab() {
  const list = useServerFn(adminListRpcReceipts);
  const { data: receipts = [], isLoading } = useQuery({ queryKey: ["admin-rpc-receipts"], queryFn: () => list() });
  const [opening, setOpening] = useState<string | null>(null);
  async function openReceipt(id: string, path: string) {
    setOpening(id);
    try {
      const { data, error } = await supabase.storage.from("receipts").createSignedUrl(path, 60);
      if (error || !data?.signedUrl) throw error ?? new Error("Receipt could not be opened");
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Could not open receipt");
    } finally {
      setOpening(null);
    }
  }
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading receipts…</p>;
  if (!receipts.length) return <p className="text-sm text-muted-foreground">No Flutterwave RPC receipts submitted.</p>;
  return <div className="rounded-2xl border border-border bg-card overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="text-xs text-muted-foreground bg-background/50"><tr>{["Submitted", "User", "Email", "Amount", "Reference", "Status", "Receipt"].map(h => <th key={h} className="text-left px-3 py-2">{h}</th>)}</tr></thead>
      <tbody>{receipts.map((r: any) => <tr key={r.id} className="border-t border-border">
        <td className="px-3 py-2 text-xs">{r.receipt_submitted_at ? new Date(r.receipt_submitted_at).toLocaleString() : "—"}</td>
        <td className="px-3 py-2 font-mono text-xs">{r.user_id.slice(0, 8)}</td>
        <td className="px-3 py-2">{r.customer_email ?? "—"}</td>
        <td className="px-3 py-2">₦{Number(r.amount).toLocaleString()}</td>
        <td className="px-3 py-2 font-mono text-xs">{r.tx_ref}</td>
        <td className="px-3 py-2">{r.status}</td>
        <td className="px-3 py-2"><button disabled={opening === r.id} className="text-primary underline" onClick={() => openReceipt(r.id, r.receipt_path)}>{opening === r.id ? "Opening…" : "View"}</button></td>
      </tr>)}</tbody>
    </table>
  </div>;
}

function BroadcastTab() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", body: "", target_user_id: "" });
  const send = useServerFn(adminBroadcast);
  const list = useServerFn(adminListBroadcasts);
  const del = useServerFn(adminDeleteBroadcast);
  const users = useServerFn(adminListUsers);
  const { data: usersList = [] } = useQuery({ queryKey: ["admin-users"], queryFn: () => users() });
  const mut = useMutation({
    mutationFn: () => send({ data: {
      title: form.title, body: form.body,
      target_user_id: form.target_user_id || null,
    }}),
    onSuccess: () => {
      toast.success(form.target_user_id ? "Sent to user" : "Broadcast active site-wide");
      setForm({ title: "", body: "", target_user_id: "" });
      qc.invalidateQueries({ queryKey: ["broadcasts-admin"] });
    },
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["broadcasts-admin"] }); },
  });
  const { data: past = [] } = useQuery({
    queryKey: ["broadcasts-admin"],
    queryFn: () => list(),
  });
  return (
    <div className="space-y-4 max-w-lg">
      <form onSubmit={e => { e.preventDefault(); mut.mutate(); }} className="rounded-2xl border border-border bg-card p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase">New broadcast</p>
        <p className="text-[11px] text-muted-foreground">Sending a broadcast replaces the previous one in the same scope. Leave user blank to send site-wide.</p>
        <select className="input w-full" value={form.target_user_id} onChange={e => setForm({ ...form, target_user_id: e.target.value })}>
          <option value="">🌍 Everyone (site-wide banner)</option>
          {usersList.map((u: any) => (
            <option key={u.id} value={u.id}>👤 @{u.username} ({u.phone ?? "—"})</option>
          ))}
        </select>
        <input required placeholder="Title" className="input w-full" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <textarea required rows={4} placeholder="Message" className="input w-full" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} />
        <button disabled={mut.isPending} className="w-full py-2.5 rounded-full gradient-red text-white text-sm font-semibold">
          {mut.isPending ? "Sending…" : form.target_user_id ? "Send to selected user" : "Publish site-wide banner"}
        </button>
        <StyleTag />
      </form>
      <div className="rounded-2xl border border-border bg-card divide-y divide-border">
        {past.map((b: any) => (
          <div key={b.id} className="p-3 text-sm flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold truncate">{b.title}</p>
                {b.active && <span className="text-[9px] uppercase bg-emerald-500/20 text-emerald-400 rounded-full px-2 py-0.5 font-bold">Live</span>}
                {b.target_user_id
                  ? <span className="text-[9px] uppercase bg-primary/20 text-primary rounded-full px-2 py-0.5 font-bold">1:1</span>
                  : <span className="text-[9px] uppercase bg-muted rounded-full px-2 py-0.5 font-bold">All</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{b.body}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{new Date(b.created_at).toLocaleString()}</p>
            </div>
            {b.active && (
              <button onClick={() => delMut.mutate(b.id)} className="text-red-400 shrink-0"><Trash2 className="size-4" /></button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StyleTag() {
  return <style>{`.input{background:var(--color-input);border:1px solid var(--color-border);border-radius:0.6rem;padding:.55rem .75rem;font-size:.9rem;color:var(--color-foreground);outline:none;display:block}`}</style>;
}
