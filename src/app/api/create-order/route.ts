import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { PLANS, isPlanId } from "@/lib/plans";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(`order:${clientIp(req)}`, 10, 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
      );
    }

    // Built lazily so a missing env var fails this request, not the whole build.
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Payment gateway is not configured" },
        { status: 500 }
      );
    }
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // The client picks a plan; the price comes from the server-side table.
    // Never accept an amount from the browser.
    const { plan } = await req.json();
    if (!isPlanId(plan)) {
      return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: PLANS[plan].amount,
      currency: "INR",
      receipt: `plan_${plan}_${Date.now()}`,
      notes: { plan },
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err: unknown) {
    // The Razorpay SDK rejects with a plain object ({ statusCode, error: {...} }),
    // not an Error instance — so surface its actual description instead of a
    // generic message, and mirror its status code (e.g. 401 on bad keys).
    let message = "Failed to create order";
    let status = 500;
    if (err instanceof Error) {
      message = err.message;
    } else if (err && typeof err === "object") {
      const e = err as { statusCode?: number; error?: { description?: string } };
      message = e.error?.description ?? message;
      status = e.statusCode ?? status;
    }
    return NextResponse.json({ error: message }, { status });
  }
}
