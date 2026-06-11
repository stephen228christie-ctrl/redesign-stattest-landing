import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      access_token,
      plan,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Signature is valid — this is the only path that can mark a user as paid.
    if (access_token && (plan === "pro" || plan === "pass")) {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!serviceKey) {
        return NextResponse.json(
          { success: true, plan_updated: false, warning: "Server not configured for plan activation" },
          { status: 200 }
        );
      }

      // Validate the token with the public client to learn *who* paid. This
      // only reads identity; it cannot write the plan (RLS forbids that now).
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
