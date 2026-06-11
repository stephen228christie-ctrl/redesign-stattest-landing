// Server-side source of truth for purchasable plans. Prices live here and
// nowhere else — the client never sends an amount, only a plan id, so it
// cannot pay ₹1 for a ₹199 plan.
//
// Plans are prepaid passes (no auto-renewal): a purchase grants `days` of
// access, and buying again stacks on top of any time remaining.
export const PLANS = {
  pro: { amount: 9900, label: "Pro Monthly", days: 30 },
  pass: { amount: 19900, label: "Dissertation Pass", days: 90 },
} as const;

export type PlanId = keyof typeof PLANS;

export function isPlanId(v: unknown): v is PlanId {
  return v === "pro" || v === "pass";
}
