import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { PLANS, isPlanId } from "@/lib/plans";
import { activatePlan } from "@/lib/activate-plan";

// Razorpay calls this server-to-server on payment events, so a user who pays
// but closes the tab before /api/verify-payment runs still gets their plan.
// Configure in the Razorpay dashboard: Settings → Webhooks → add
//   https://<site>/api/razorpay-webhook  with event payment.captured,
// and put the webhook secret in RAZORPAY_WEBHOOK_SECRET.
// Activation is idempotent (unique payment id), so this and verify-payment
// can both fire for the same payment safely.
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
    }

    // Signature is computed over the raw body — read it before parsing.
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") ?? "";
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

    const valid =
      expected.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event: {
      event?: string;
      payload?: {
        payment?: {
          entity?: {
            id?: string;
            order_id?: string;
            amount?: number;
            currency?: string;
          };
        };
      };
    } = JSON.parse(rawBody);

    if (event.event !== "payment.captured") {
      // Acknowledge everything else so Razorpay doesn't retry.
      return NextResponse.json({ received: true });
    }

    const payment = event.payload?.payment?.entity;
    if (!payment?.id || !payment.order_id) {
      return NextResponse.json({ received: true });
    }

    // The plan and buyer come from the order our server created.
    const orderRes = await fetch(
      `https://api.razorpay.com/v1/orders/${payment.order_id}`,
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
      // Non-2xx makes Razorpay retry later — right call for a transient failure.
      return NextResponse.json({ error: "Could not load order" }, { status: 500 });
    }
    const order: { amount: number; notes?: { plan?: string; user_id?: string } } =
      await orderRes.json();

    const plan = order.notes?.plan;
    const userId = order.notes?.user_id;
    if (!isPlanId(plan) || !userId || PLANS[plan].amount !== order.amount) {
      // Not one of our plan orders — acknowledge and ignore.
      return NextResponse.json({ received: true });
    }

    const result = await activatePlan({
      userId,
      plan,
      razorpayOrderId: payment.order_id,
      razorpayPaymentId: payment.id,
      amount: payment.amount ?? order.amount,
      currency: payment.currency ?? "INR",
      source: "webhook",
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.warning }, { status: 500 });
    }
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
