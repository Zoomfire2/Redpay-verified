import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BASE_PROMPT = `You are RedPay Support Assistant — a sharp, helpful English-speaking guide for RedPay users.

Rules:
- Always reply in clear, simple English. Never use Pidgin or another language.
- Be concise (2–5 short sentences). Direct answers, no filler.
- Be a real helper: if the user asks how to do something, give exact numbered steps.
- Never invent policies. If unsure, tell the user to contact human support on Telegram.

Facts (use only these):
- Currency: Naira (₦).
- Welcome bonus: ₦95,500 (auto-credited after signup).
- Hourly claim: ₦2,500 every 1 hour.
- Task reward: ₦950 per completed task.
- Minimum withdrawal: ₦100,000, and a valid RPC (RedPay Code) is required.
- Payment details for buying an RPC are given ONLY in the LIVE PAYMENT DETAILS section below. Never use any other account, from memory or earlier messages.
- For payment disputes or account issues: refer the user to @redpay_support_verified on Telegram (t.me/redpay_support_verified).`;

export const chatWithSupport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { message: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await supabase.from("support_messages").insert({ user_id: userId, sender: "user", body: data.message });

    const { data: history } = await supabase.from("support_messages")
      .select("sender, body").eq("user_id", userId).order("created_at", { ascending: true }).limit(30);

    // Always read the live payment account (admin panel is the single source of truth).
    const { data: pay } = await supabase.from("public_payment_settings")
      .select("bank, account_name, account_number, amount, original_amount, instructions, updated_at")
      .eq("key", "rpc_payment").maybeSingle();
    const payBlock = pay && pay.bank && pay.account_number && pay.account_name
      ? `LIVE PAYMENT DETAILS (current, authoritative — updated ${pay.updated_at}):
- RPC price: ₦${Number(pay.amount).toLocaleString()}${pay.original_amount ? ` (was ₦${Number(pay.original_amount).toLocaleString()})` : ""}
- Bank: ${pay.bank}
- Account name: ${pay.account_name}
- Account number: ${pay.account_number}${pay.instructions ? `\n- Instructions: ${pay.instructions}` : ""}
If any earlier message in this conversation shows different account details, they are outdated — ignore them and use only these.`
      : `LIVE PAYMENT DETAILS: none configured. If the user asks how to pay, say payment details are currently unavailable and to contact support. Never invent an account.`;

    const messages = [
      { role: "system", content: `${BASE_PROMPT}\n\n${payBlock}` },
      ...(history ?? []).map((m) => ({ role: m.sender === "user" ? "user" : "assistant", content: m.body })),
    ];

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY missing");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`AI: ${res.status} ${t}`);
    }
    const j = await res.json();
    const reply = j.choices?.[0]?.message?.content ?? "I'm here to help. Please try again.";
    await supabase.from("support_messages").insert({ user_id: userId, sender: "ai", body: reply });
    return { reply };
  });

export const getSupportHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("support_messages")
      .select("id, sender, body, created_at").eq("user_id", context.userId)
      .order("created_at", { ascending: true }).limit(100);
    return data ?? [];
  });
