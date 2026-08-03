-- INTENTIONAL SECURITY REGRESSION -- CI PROOF FIXTURE -- DO NOT MERGE
--
-- This file exists to answer one question: when tenant isolation on
-- daily_sales is broken, does the database CI job actually go red, and does it
-- go red because the isolation assertions were reached rather than for some
-- unrelated reason?
--
-- Until that has been observed, a green pgTAP job is not evidence of anything.
-- It is equally consistent with a suite whose assertions cannot fail -- which
-- is exactly the defect DL-026 found and made a standing rule about.
--
-- What it does: replaces the USING clause of daily_sales_select_member with
-- `true`, so every authenticated user reads every business's takings. The
-- policy keeps its name, so the schema-level policies_are() assertion in
-- 05_daily_sales.test.sql still passes. That is deliberate: the point is to
-- show that a policy which looks correct by name and wrong by predicate is
-- caught by the behavioural assertions, not by the shape checks.
--
-- Where it runs: applied by psql to the disposable local stack on a GitHub
-- runner, on a throwaway branch, after `supabase db reset` and before the
-- suites. It is never part of a migration, never applied to the linked
-- development project, and never merged to main or develop.
--
-- Expected failures, recorded before the run:
--
--   02_rls_isolation.test.sql
--     * a member reads audit history for exactly the businesses whose sales
--       they can read ...
--     * the same holds for the second owner ...
--     * owner A sees only their own takings ...
--   05_daily_sales.test.sql
--     * an outsider sees none of another business's takings
--     * the outsider cannot see that day, so it is an id they could not have
--       found for themselves
--
-- The RPC paths are not expected to change: record_daily_sales() and
-- delete_daily_sales() are SECURITY DEFINER and test membership explicitly,
-- so they are unaffected by the read policy.

drop policy daily_sales_select_member on public.daily_sales;

create policy daily_sales_select_member
  on public.daily_sales
  for select
  to authenticated
  using (true);
