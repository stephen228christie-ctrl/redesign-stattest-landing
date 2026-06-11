"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sb } from "@/lib/supabase";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

interface Props {
  amount: number; // in paise
  planName: string;
  className?: string;
  children: React.ReactNode;
}

function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function RazorpayButton({ amount, planName, className, children }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);

    const {
      data: { session },
    } = await sb.auth.getSession();

    if (!session) {
      router.push("/login?tab=signup");
      setLoading(false);
      return;
    }

    const loaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!loaded) {
      setError("Failed to load payment gateway. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, receipt: `plan_${planName}_${Date.now()}` }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Could not create order");
      }

      const { order_id, amount: orderAmount, currency } = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency,
        name: "StatTest",
        description: planName,
        order_id,
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verify = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const result = await verify.json();
            if (verify.ok && result.success) {
              window.location.href = "/dashboard";
            } else {
              setError("Payment verification failed. Contact support.");
            }
          } catch {
            setError("Payment verification failed. Contact support.");
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
        prefill: {},
        theme: { color: "#111827" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp: { error: { description: string } }) => {
        setError(resp.error.description ?? "Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleClick} disabled={loading} className={className}>
        {loading ? "Loading…" : children}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
