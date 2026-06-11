import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// Deletes the caller's own account. Identity comes from their session token,
// so a user can only ever delete themselves. The auth.users delete cascades
// to profiles and analyses; payment records are kept but anonymized
// (payments.user_id is set null by FK) for accounting.
export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(`delete:${clientIp(req)}`, 3, 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
      );
    }

    const { access_token } = await req.json();
    if (!access_token) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    const {
      data: { user },
    } = await authClient.auth.getUser(access_token);
    if (!user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      return NextResponse.json(
        { error: "Account deletion is not configured" },
        { status: 500 }
      );
    }
    const admin = createClient(SUPABASE_URL, serviceKey, {
      auth: { persistSession: false },
    });

    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ deleted: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Deletion failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
