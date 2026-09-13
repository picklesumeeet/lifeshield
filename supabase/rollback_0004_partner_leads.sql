-- =========================================================================
-- rollback_0004_partner_leads.sql
--
-- Undoes everything that migration 0004 (and the bootstrap file) added on
-- top of the old-funnel schema (0001–0003). Safe to run when you accidentally
-- applied the partner-receiver changes to the wrong project.
--
-- What this drops:
--   - public.lead_events table
--   - public.api_keys table
--   - all columns added to public.leads by 0004
--   - the two indexes added to public.leads by 0004
--   - restores the NOT NULL constraint on leads.session_id
--
-- What this DOES NOT touch:
--   - public.leads (base columns from 0001/0002/0003)
--   - public.admin_users
--   - any existing rows in public.leads
--
-- Safety check before running:
--   1. Confirm you have no real partner-received leads in public.leads
--      (they'd have api_key_id set):
--        select count(*) from public.leads where api_key_id is not null;
--      -- Expect: 0 on the "wrong" project.
--   2. Confirm there are no leads with a null session_id (needed for the
--      NOT NULL restoration to succeed):
--        select count(*) from public.leads where session_id is null;
--      -- Expect: 0.
--
-- If either check returns > 0, STOP and read the notes at the bottom of
-- this file before proceeding.
-- =========================================================================

begin;

-- Drop the child tables first (lead_events references api_keys).
drop table if exists public.lead_events cascade;
drop table if exists public.api_keys cascade;

-- Drop the indexes added to leads by 0004.
drop index if exists public.leads_partner_idempotency_idx;
drop index if exists public.leads_source_idx;
drop index if exists public.leads_vendor_lead_id_idx;

-- Drop the columns added to leads by 0004.
alter table public.leads
  drop column if exists source,
  drop column if exists api_key_id,
  drop column if exists vendor_lead_id,
  drop column if exists is_test,
  drop column if exists submitted_at,
  drop column if exists intent,
  drop column if exists coverage_unsure,
  drop column if exists zip,
  drop column if exists street_address,
  drop column if exists city,
  drop column if exists consent_given,
  drop column if exists consent_language,
  drop column if exists consenting_entity,
  drop column if exists partner_list_version,
  drop column if exists partner_list_date,
  drop column if exists trusted_form_cert_url,
  drop column if exists jornaya_lead_id,
  drop column if exists consumer_ip,
  drop column if exists user_agent,
  drop column if exists landing_page_url,
  drop column if exists utm_source,
  drop column if exists utm_medium,
  drop column if exists utm_campaign,
  drop column if exists utm_content,
  drop column if exists utm_term;

-- Restore the NOT NULL constraint on session_id that 0004 dropped.
-- Will fail if any rows have session_id IS NULL — see safety check above.
alter table public.leads alter column session_id set not null;

commit;

-- =========================================================================
-- Notes
-- =========================================================================
-- - Everything runs inside a single transaction. If any statement fails
--   (e.g. the NOT NULL restoration), the whole rollback is aborted and
--   the DB stays in its post-0004 state. No partial rollback.
--
-- - If the NOT NULL restore fails because rows have null session_id,
--   you either need to:
--     (a) delete/repair those rows first, then re-run this file, or
--     (b) leave session_id nullable (drop the last ALTER before running).
--
-- - If real partner leads DID land in public.leads (api_key_id not null),
--   dropping api_key_id here loses that reference. Export first.
-- =========================================================================
