import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Admin credentials live in server secrets (ADMIN_USERNAME / ADMIN_PASSWORD).
async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Forbidden");
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function logAction(
  sb: any,
  claims: any,
  adminId: string,
  action: string,
  opts: { target_user_id?: string | null; amount?: number | null; details?: Record<string, unknown> } = {},
) {
  let target_label: string | null = null;
  if (opts.target_user_id) {
    const { data } = await sb.from("profiles").select("username, email").eq("id", opts.target_user_id).maybeSingle();
    target_label = data ? `@${data.username}${data.email ? ` (${data.email})` : ""}` : null;
  }
  await sb.from("admin_activity_log").insert({
    admin_id: adminId,
    admin_label: claims?.email ?? adminId,
    action,
    target_user_id: opts.target_user_id ?? null,
    target_label,
    amount: opts.amount ?? null,
    details: opts.details ?? null,
  });
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export const adminCheck = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    return { isAdmin: !!data };
  });

export const adminLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { username: string; password: string }) => ({
    username: String(d?.username ?? "").slice(0, 100),
    password: String(d?.password ?? "").slice(0, 200),
  }))
  .handler(async ({ data, context }) => {
    const u = process.env["ADMIN_USERNAME"] ?? "";
    const p = process.env["ADMIN_PASSWORD"] ?? "";
    if (!u || !p || !safeEqual(data.username, u) || !safeEqual(data.password, p)) {
      return { ok: false as const };
    }
    const sb = await admin();
    await sb.from("user_roles").upsert({ user_id: context.userId, role: "admin" }, { onConflict: "user_id,role" });
    return { ok: true as const };
  });

export const adminUpdatePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { bank: string; account_number: string; account_name: string; amount: number; original_amount?: number | null; instructions?: string | null }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    if (!data.bank?.trim() || !data.account_name?.trim() || !data.account_number?.trim()) throw new Error("Bank, account name and number are required");
    if (!(Number(data.amount) >= 0)) throw new Error("Invalid amount");
    const sb = await admin();
    const { error } = await sb.from("public_payment_settings").upsert({
      key: "rpc_payment",
      bank: data.bank.trim(),
      account_name: data.account_name.trim(),
      account_number: data.account_number.trim(),
      amount: Number(data.amount),
      original_amount: data.original_amount ?? null,
      instructions: data.instructions ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    await logAction(sb, context.claims, context.userId, "payment_settings_changed", {
      details: { bank: data.bank, account_name: data.account_name, amount: data.amount },
    });
    return { ok: true as const };
  });

export const adminGetPayment = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = await admin();
    const { data } = await sb.from("public_payment_settings").select("*").eq("key", "rpc_payment").maybeSingle();
    return data;
  });

export const adminAddTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { title: string; platform: string; url: string; reward?: number }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = await admin();
    await sb.from("tasks").insert({ title: data.title, platform: data.platform, url: data.url, reward: data.reward ?? 950 });
    return { ok: true as const };
  });

export const adminRemoveTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { taskId: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = await admin();
    await sb.from("tasks").delete().eq("id", data.taskId);
    return { ok: true as const };
  });

export const adminBalance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; mode: "add" | "remove" | "set"; amount: number }) => {
    const amount = Number(d?.amount);
    if (!d?.userId || !["add", "remove", "set"].includes(d.mode)) throw new Error("Invalid input");
    if (!Number.isFinite(amount) || amount < 0) throw new Error("Amount must be a positive number");
    return { userId: d.userId, mode: d.mode, amount };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = await admin();
    const { data: p } = await sb.from("profiles").select("balance").eq("id", data.userId).single();
    if (!p) throw new Error("User not found");
    const current = Number(p.balance ?? 0);
    let next = current;
    if (data.mode === "add") next = current + data.amount;
    if (data.mode === "remove") {
      if (data.amount > current) throw new Error("Cannot remove more than the current balance");
      next = current - data.amount;
    }
    if (data.mode === "set") next = data.amount;
    const { error } = await sb.from("profiles").update({ balance: next }).eq("id", data.userId);
    if (error) throw new Error(error.message);
    const action = data.mode === "add" ? "money_added" : data.mode === "remove" ? "money_removed" : "balance_changed";
    await logAction(sb, context.claims, context.userId, action, {
      target_user_id: data.userId, amount: data.amount, details: { from: current, to: next },
    });
    return { ok: true as const, balance: next };
  });

// Legacy helper kept for compatibility
export const adminAdjustBalance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; delta: number }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = await admin();
    const { data: p } = await sb.from("profiles").select("balance").eq("id", data.userId).single();
    const cur = Number(p?.balance ?? 0);
    const next = Math.max(0, cur + data.delta);
    await sb.from("profiles").update({ balance: next }).eq("id", data.userId);
    await logAction(sb, context.claims, context.userId, data.delta >= 0 ? "money_added" : "money_removed", {
      target_user_id: data.userId, amount: Math.abs(data.delta), details: { from: cur, to: next },
    });
    return { ok: true as const, balance: next };
  });

export const adminSetStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; status: "active" | "restricted" | "banned"; reason?: string | null }) => {
    if (!d?.userId || !["active", "restricted", "banned"].includes(d.status)) throw new Error("Invalid input");
    return { userId: d.userId, status: d.status, reason: d.reason ? String(d.reason).slice(0, 300) : null };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    if (data.userId === context.userId && data.status !== "active") throw new Error("You cannot restrict your own admin account");
    const sb = await admin();
    const { data: prev } = await sb.from("profiles").select("status").eq("id", data.userId).single();
    if (!prev) throw new Error("User not found");
    const { error } = await sb.from("profiles").update({
      status: data.status,
      status_reason: data.status === "active" ? null : data.reason,
      status_changed_at: new Date().toISOString(),
    }).eq("id", data.userId);
    if (error) throw new Error(error.message);
    let action = "user_status_changed";
    if (data.status === "restricted") action = "user_suspended";
    else if (data.status === "banned") action = "user_banned";
    else if (prev.status === "banned") action = "user_unbanned";
    else if (prev.status === "restricted") action = "user_unsuspended";
    await logAction(sb, context.claims, context.userId, action, { target_user_id: data.userId, details: data.reason ? { reason: data.reason } : undefined });
    return { ok: true as const };
  });

// Legacy helper kept for compatibility
export const adminUpdateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; balance?: number; status?: string; status_reason?: string | null }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = await admin();
    const patch: Record<string, unknown> = {};
    if (typeof data.balance === "number" && data.balance >= 0) patch.balance = data.balance;
    if (data.status) { patch.status = data.status; patch.status_changed_at = new Date().toISOString(); }
    if (data.status_reason !== undefined) patch.status_reason = data.status_reason;
    await sb.from("profiles").update(patch).eq("id", data.userId);
    return { ok: true as const };
  });

export const adminSaveBroadcast = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string | null; title: string; body: string; link?: string | null; active: boolean; target_user_id?: string | null }) => {
    const title = String(d?.title ?? "").trim().slice(0, 150);
    const body = String(d?.body ?? "").trim().slice(0, 2000);
    let link = d?.link ? String(d.link).trim().slice(0, 500) : null;
    if (link && !/^https?:\/\//i.test(link)) throw new Error("Link must start with http:// or https://");
    if (!title || !body) throw new Error("Title and message are required");
    return { id: d.id ?? null, title, body, link: link || null, active: !!d.active, target_user_id: d.target_user_id || null };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = await admin();
    const now = new Date().toISOString();
    if (data.id) {
      const { error } = await sb.from("broadcasts").update({
        title: data.title, body: data.body, link: data.link, active: data.active, updated_at: now,
      }).eq("id", data.id);
      if (error) throw new Error(error.message);
      await logAction(sb, context.claims, context.userId, "broadcast_updated", { target_user_id: data.target_user_id, details: { title: data.title, active: data.active } });
      return { ok: true as const };
    }
    const { error } = await sb.from("broadcasts").insert({
      title: data.title, body: data.body, link: data.link, active: data.active,
      target_user_id: data.target_user_id, updated_at: now,
    });
    if (error) throw new Error(error.message);
    await logAction(sb, context.claims, context.userId, "broadcast_created", { target_user_id: data.target_user_id, details: { title: data.title } });
    return { ok: true as const };
  });

export const adminDeleteBroadcast = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = await admin();
    const { data: b } = await sb.from("broadcasts").select("title, target_user_id").eq("id", data.id).maybeSingle();
    await sb.from("broadcasts").delete().eq("id", data.id);
    await logAction(sb, context.claims, context.userId, "broadcast_deleted", { target_user_id: b?.target_user_id ?? null, details: { title: b?.title } });
    return { ok: true as const };
  });

export const adminListBroadcasts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = await admin();
    const { data } = await sb.from("broadcasts")
      .select("id, title, body, link, target_user_id, active, created_at, updated_at")
      .order("created_at", { ascending: false }).limit(100);
    return data ?? [];
  });

export const adminListActivity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = await admin();
    const { data } = await sb.from("admin_activity_log").select("*").order("created_at", { ascending: false }).limit(300);
    return data ?? [];
  });

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = await admin();
    const [users, withdrawals, intakes, tasks] = await Promise.all([
      sb.from("profiles").select("id", { count: "exact", head: true }),
      sb.from("withdrawal_attempts").select("id", { count: "exact", head: true }),
      sb.from("rpc_intakes").select("id", { count: "exact", head: true }),
      sb.from("task_completions").select("id", { count: "exact", head: true }),
    ]);
    return { users: users.count ?? 0, withdrawals: withdrawals.count ?? 0, intakes: intakes.count ?? 0, completions: tasks.count ?? 0 };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = await admin();
    const { data } = await sb.from("profiles")
      .select("id, username, full_name, email, phone, country, balance, status, status_reason, status_changed_at, created_at, last_seen_at, last_claim_at, referred_by")
      .order("created_at", { ascending: false }).limit(1000);
    return data ?? [];
  });

export const adminListWithdrawals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = await admin();
    const { data } = await sb.from("withdrawal_attempts")
      .select("id, user_id, amount, bank, account_name, account_number, rpc_tried, created_at")
      .order("created_at", { ascending: false }).limit(200);
    return data ?? [];
  });

export const adminListIntakes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = await admin();
    const { data } = await sb.from("rpc_intakes")
      .select("id, user_id, email, phone, created_at")
      .order("created_at", { ascending: false }).limit(200);
    return data ?? [];
  });
