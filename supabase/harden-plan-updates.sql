-- Security hardening: stop the browser from being able to change a plan.
--
-- With the service-role key now doing the plan write in /api/verify-payment
-- (server-side, only after a verified Razorpay signature), clients no longer
-- need — and must not have — permission to UPDATE their own profile. Dropping
-- this policy means the ONLY way profiles.plan can change is through a verified
-- payment. The service-role key bypasses RLS, so the payment flow still works.
--
-- Run this in the Supabase SQL Editor AFTER the service-role key is deployed.

drop policy if exists "Users can update own profile" on public.profiles;
