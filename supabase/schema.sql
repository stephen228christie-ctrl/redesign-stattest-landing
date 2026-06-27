-- StatTest database schema
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: it uses "if not exists" / "drop ... if exists" throughout.

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user, holds their name and plan.
-- plan is one of 'free' | 'pro' | 'pass'. The payment flow flips it to
-- 'pro'/'pass' from /api/verify-payment after a verified Razorpay signature.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text,
  plan       text not null default 'free',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile"   on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can read own profile"
  on public.profiles for select
  to authenticated using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated with check (auth.uid() = id);

-- NOTE: there is deliberately NO "update" policy for profiles. The plan and
-- plan_expires_at columns must only ever be changed by the server (service
-- role, which bypasses RLS) after a verified Razorpay payment. Granting users
-- update access would let anyone set their own plan to 'pro' for free. The
-- drop above stays so re-running this file removes any such policy.

-- ---------------------------------------------------------------------------
-- analyses: saved test-selector results, used by the dashboard history and
-- the free-tier usage counter.
-- ---------------------------------------------------------------------------
create table if not exists public.analyses (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  recommended_test  text,
  test_emoji        text,
  test_category     text,
  research_question text,
  explanation       text,
  apa_template      text,
  assumptions       jsonb,
  inputs            jsonb,
  created_at        timestamptz not null default now()
);

alter table public.analyses enable row level security;

drop policy if exists "Users can read own analyses"   on public.analyses;
drop policy if exists "Users can insert own analyses" on public.analyses;

create policy "Users can read own analyses"
  on public.analyses for select
  to authenticated using (auth.uid() = user_id);

create policy "Users can insert own analyses"
  on public.analyses for insert
  to authenticated with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Auto-create a profile row whenever a new auth user signs up, pulling the
-- name they entered (stored in user metadata) into the profile.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, plan)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''), 'free')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Backfill: create profile rows for users who signed up before this schema
-- existed (e.g. the account you've been testing with).
-- ---------------------------------------------------------------------------
insert into public.profiles (id, name, plan, created_at)
select id, coalesce(raw_user_meta_data->>'name', ''), 'free', created_at
from auth.users
on conflict (id) do nothing;
