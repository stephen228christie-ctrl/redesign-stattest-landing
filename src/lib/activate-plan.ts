// Server-only plan activation. Called from /api/verify-payment and
// /api/razorpay-webhook AFTER cryptographic verification — never import
// this from client code.
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/supabase";
import { PLANS, PlanId } from "@/lib/plans";

interface ActivateArgs {
  userId: string;
  plan: PlanId;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  source: "verify" | "webhook";
}

export async function activatePlan(
  args: ActivateArgs
): Promise<{ ok: boolean; alreadyProcessed?: boolean; warning?: string }> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return { ok: false, warning: "Server not configured for plan activation" };
  }

  const admin = createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false },
  });

  // Record the payment first. The unique razorpay_payment_id makes this the
  // idempotency gate: if the row already exists (verify ran AND the webhook
  // fired, or a replayed request), skip the extension so one payment can
  // never grant time twice.
  const { error: insertError } = await admin.from("payments").insert({
    user_id: args.userId,
    razorpay_order_id: args.razorpayOrderId,
    razorpay_payment_id: args.razorpayPaymentId,
    plan: args.plan,
    amount: args.amount,
    currency: args.currency,
    source: args.source,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      // duplicate payment id — already processed
      return { ok: true, alreadyProcessed: true };
    }
    return { ok: false, warning: insertError.message };
  }

  // Extend from whichever is later: now, or the time they already have left.
  const { data: profile } = await admin
    .from("profiles")
    .select("plan_expires_at")
    .eq("id", args.userId)
    .single();

  const now = Date.now();
  const current = profile?.plan_expires_at
    ? new Date(profile.plan_expires_at).getTime()
    : 0;
  const base = Math.max(now, current);
  const expiresAt = new Date(
    base + PLANS[args.plan].days * 24 * 60 * 60 * 1000
  ).toISOString();

  const { error: updateError } = await admin
    .from("profiles")
    .update({ plan: args.plan, plan_expires_at: expiresAt })
    .eq("id", args.userId);

  if (updateError) return { ok: false, warning: updateError.message };
  return { ok: true };
}
