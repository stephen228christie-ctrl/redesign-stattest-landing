// Client-safe helper: does this profile currently have a paid plan?
// NULL expiry on a paid plan means no expiry (manual/grandfathered grants).
export function planIsActive(profile: {
  plan?: string | null;
  plan_expires_at?: string | null;
} | null): boolean {
  if (!profile?.plan || profile.plan === "free") return false;
  if (!profile.plan_expires_at) return true;
  return new Date(profile.plan_expires_at).getTime() > Date.now();
}
