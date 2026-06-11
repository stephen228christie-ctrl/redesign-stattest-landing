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
    // Upgrade the buyer's plan, identified by their Supabase access token.
    if (access_token && (plan === "pro" || plan === "pass")) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${access_token}` } },
        auth: { persistSession: false },
      });

      const {
        data: { user },
      } = await supabase.auth.getUser(access_token);

      if (user) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ plan })
          .eq("id", user.id);

        if (updateError) {
          // Payment is genuine but the plan write failed — surface it so the
          // client can tell the user to contact support rather than silently
          // pretending the upgrade went through.
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
