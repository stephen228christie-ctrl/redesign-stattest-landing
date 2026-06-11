import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase";
import { PLANS, isPlanId } from "@/lib/plans";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(`verify:${clientIp(req)}`, 10, 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, access_token } =
      await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    const valid =
      expected.length === razorpay_signature.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Signature is valid. Determine WHICH plan was bought from the order our
    // own server created (notes.plan + amount check) — never from the client,
    // otherwise a ₹1 order could activate a ₹199 plan.
    const orderRes = await fetch(
      `https://api.razorpay.com/v1/orders/${razorpay_order_id}`,
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
            ).toString("base64"),
        },
      }
    );
    if (!orderRes.ok) {
      return NextResponse.json(
        { success: true, plan_updated: false, warning: "Could not load order details" },
        { status: 200 }
      );
    }
    const order: { amount: number; notes?: { plan?: string } } = await orderRes.json();
    const plan = order.notes?.plan;

    if (!isPlanId(plan) || PLANS[plan].amount !== order.amount) {
      return NextResponse.json(
        { success: true, plan_updated: false, warning: "Order does not match a known plan" },
        { status: 200 }
      );
    }

    if (access_token) {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!serviceKey) {
        return NextResponse.json(
          { success: true, plan_updated: false, warning: "Server not configured for plan activation" },
          { status: 200 }
        );
      }

      // Validate the token with the public client to learn *who* paid. This
      // only reads identity; it cannot write the plan (RLS forbids that).
      const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
      });
      const {
        data: { user },
      } = await authClient.auth.getUser(access_token);

      if (user) {
        // Perform the actual plan write with the service-role key, which
        // bypasses RLS. Because this key lives only on the server and runs
        // only after the signature check above, a verified payment is the
        // sole way a user can become 'pro'/'pass' — the browser is never
        // trusted to set its own plan.
        const admin = createClient(SUPABASE_URL, serviceKey, {
          auth: { persistSession: false },
        });

        const { error: updateError } = await admin
          .from("profiles")
          .update({ plan })
          .eq("id", user.id);

        if (updateError) {
          return NextResponse.json(
            { success: true, plan_updated: false, warning: updateError.message },
            { status: 200 }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      plan_updated: true,
      payment_id: razorpay_payment_id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
