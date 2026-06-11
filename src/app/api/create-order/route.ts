import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  try {
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

    const { amount, currency = "INR", receipt } = await req.json();

    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: "Amount must be at least 100 paise" },
        { status: 400 }
      );
    }

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: receipt ?? `receipt_${Date.now()}`,
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
