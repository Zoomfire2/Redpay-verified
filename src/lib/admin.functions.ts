import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Admin credential: username "SavageEc" password "savage001"
async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Forbidden");
}

export const adminLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { username: string; password: string }) => d)
  .handler(async ({ data, context }) => {
    if (data.username !== "SavageEc" || data.password !== "savage001") {
      return { ok: false as const };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_roles").upsert({ user_id: context.userId, role: "admin" }, { onConflict: "user_id,role" });
    return { ok: true as const };
  });

export const adminUpdatePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { bank: string; account_number: string; account_name: string; amount: number; original_amount?: number }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("public_payment_settings").upsert({
      key: "rpc_payment",
      bank: data.bank,
      account_name: data.account_name,
      account_number: data.account_number,
      amount: data.amount,
      original_amount: data.original_amount ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "key" });
    return { ok: true as const };
  });

export const adminAddTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { title: string; platform: string; url: string; reward?: number }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("tasks").insert({
      title: data.title, platform: data.platform, url: data.url, reward: data.reward ?? 950,
    });
    return { ok: true as const };
  });

export const adminRemoveTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { taskId: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("tasks").delete().eq("id", data.taskId);
    return { ok: true as const };
  });

export const adminAdjustBalance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; delta: number }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: p } = await supabaseAdmin.from("profiles").select("balance").eq("id", data.userId).single();
    const next = Math.max(0, Number(p?.balance ?? 0) + data.delta);
    await supabaseAdmin.from("profiles").update({ balance: next }).eq("id", data.userId);
    return { ok: true as const, balance: next };
  });

export const adminBroadcast = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { title: string; body: string; target_user_id?: string | null }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.target_user_id) {
      await supabaseAdmin.from("broadcasts").update({ active: false })
        .eq("active", true).eq("target_user_id", data.target_user_id);
    } else {
      await supabaseAdmin.from("broadcasts").update({ active: false })
        .eq("active", true).is("target_user_id", null);
    }
    await supabaseAdmin.from("broadcasts").insert({
      title: data.title, body: data.body,
      target_user_id: data.target_user_id ?? null, active: true,
    });
    return { ok: true as const };
  });

export const adminDeleteBroadcast = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("broadcasts").update({ active: false }).eq("id", data.id);
    return { ok: true as const };
  });

export const adminListBroadcasts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("broadcasts")
      .select("id, title, body, target_user_id, active, created_at")
      .order("created_at", { ascending: false }).limit(50);
    return data ?? [];
  });

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [users, withdrawals, intakes, tasks] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("withdrawal_attempts").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("rpc_intakes").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("task_completions").select("id", { count: "exact", head: true }),
    ]);
    return {
      users: users.count ?? 0,
      withdrawals: withdrawals.count ?? 0,
      intakes: intakes.count ?? 0,
      completions: tasks.count ?? 0,
    };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("profiles")
      .select("id, username, email, phone, country, balance, status, created_at, referred_by")
      .order("created_at", { ascending: false }).limit(500);
    return data ?? [];
  });

export const adminUpdateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; balance?: number; status?: string; status_reason?: string | null }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: { balance?: number; status?: string; status_reason?: string | null; status_changed_at?: string } = {};
    if (typeof data.balance === "number") patch.balance = data.balance;
    if (data.status) { patch.status = data.status; patch.status_changed_at = new Date().toISOString(); }
    if (data.status_reason !== undefined) patch.status_reason = data.status_reason;
    await supabaseAdmin.from("profiles").update(patch).eq("id", data.userId);
    return { ok: true as const };
  });

export const adminListWithdrawals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("withdrawal_attempts")
      .select("id, user_id, amount, bank, account_name, account_number, rpc_tried, created_at")
      .order("created_at", { ascending: false }).limit(200);
    return data ?? [];
  });

export const adminListIntakes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("rpc_intakes")
      .select("id, user_id, email, phone, created_at")
      .order("created_at", { ascending: false }).limit(200);
    return data ?? [];
  });
