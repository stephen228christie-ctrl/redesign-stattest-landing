-- Migration 2: plan expiry + payment records.
-- Run once in the Supabase SQL Editor. Safe to re-run.

-- ---------------------------------------------------------------------------
-- Plan expiry: plans are prepaid passes (pro = 30 days, pass = 90 days).
-- NULL means no expiry (grandfathered/manual grants). The app treats a row
-- with plan != 'free' AND (plan_expires_at IS NULL OR in the future) as paid.
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists plan_expires_at timestamptz;

-- ---------------------------------------------------------------------------
-- payments: one row per verified Razorpay payment. Written only by the
-- server (service role) from /api/verify-payment and /api/razorpay-webhook.
-- The unique razorpay_payment_id makes activation idempotent: replaying the
-- same payment cannot extend a plan twice.
-- user_id is nullable + ON DELETE SET NULL so financial records survive
-- account deletion in anonymized form.
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users (id) on delete set null,
  razorpay_order_id   text not null,
  razorpay_payment_id text not null unique,
  plan                text not null,
  amount              integer not null,
  currency            text not null default 'INR',
  source              text not null default 'verify', -- 'verify' | 'webhook'
  created_at          timestamptz not null default now()
);

alter table public.payments enable row level security;

drop policy if exists "Users can read own payments" on public.payments;

create policy "Users can read own payments"
  on public.payments for select
  to authenticated using (auth.uid() = user_id);

-- No insert/update/delete policies on purpose: only the service role
-- (which bypasses RLS) may write payment records.
