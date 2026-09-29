import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SIGNUP_BONUS = 95500;
const CLAIM_AMOUNT = 2500;
const CLAIM_INTERVAL_HOURS = 1;
const TASK_REWARD = 950;

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    let { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (!profile) {
      // Fallback (shouldn't happen due to trigger)
      const { data: user } = await supabase.auth.getUser();
      const uname = (user.user?.email?.split("@")[0] ?? "user") + "_" + Math.random().toString(36).slice(2, 6);
      const { data: created } = await supabase.from("profiles").insert({
        id: userId, username: uname, email: user.user?.email,
      }).select("*").single();
      profile = created;
    }
    // Auto apply signup bonus once
    if (profile && !profile.signup_bonus_claimed && (profile.status ?? "active") === "active") {
      const { data: updated } = await supabase.from("profiles").update({
        balance: Number(profile.balance) + SIGNUP_BONUS,
        signup_bonus_claimed: true,
      }).eq("id", userId).select("*").single();
      profile = updated ?? profile;
    }
    return profile;
  });

export const claimBonus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (!profile) throw new Error("Profile not found");
    if (profile.last_claim_at) {
      const last = new Date(profile.last_claim_at).getTime();
      const diffH = (Date.now() - last) / 3_600_000;
      if (diffH < CLAIM_INTERVAL_HOURS) {
        const remainMs = Math.ceil((CLAIM_INTERVAL_HOURS * 3_600_000) - (Date.now() - last));
        return { ok: false as const, remainMs };
      }
    }
    const { data: updated } = await supabase.from("profiles").update({
      balance: Number(profile.balance) + CLAIM_AMOUNT,
      last_claim_at: new Date().toISOString(),
    }).eq("id", userId).select("*").single();
    return { ok: true as const, amount: CLAIM_AMOUNT, profile: updated };
  });

export const completeTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { taskId: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error: insErr } = await supabase.from("task_completions").insert({
      user_id: userId, task_id: data.taskId,
    });
    if (insErr) {
      if (insErr.code === "23505") return { ok: false as const, reason: "already" };
      throw insErr;
    }
    const { data: profile } = await supabase.from("profiles").select("balance").eq("id", userId).single();
    if (profile) {
      await supabase.from("profiles").update({ balance: Number(profile.balance) + TASK_REWARD }).eq("id", userId);
    }
    return { ok: true as const, amount: TASK_REWARD };
  });

export const submitWithdrawal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { amount: number; bank: string; account_name: string; account_number: string; rpc: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await supabase.from("withdrawal_attempts").insert({
      user_id: userId,
      amount: data.amount,
      bank: data.bank,
      account_name: data.account_name,
      account_number: data.account_number,
      rpc_tried: data.rpc || null,
    });
    return { ok: true as const };
  });

export const logRpcIntake = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { email: string; phone: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await supabase.from("rpc_intakes").insert({ user_id: userId, email: data.email, phone: data.phone });
    return { ok: true as const };
  });
