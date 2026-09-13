-- =========================================================================
-- bootstrap.sql
--
-- Single-file schema for setting up a fresh Supabase project.
-- Concatenates migrations 0001–0004 in order. Idempotent — safe to re-run.
--
-- Usage:
--   1. Open the target Supabase project → SQL Editor → New query
--   2. Paste this entire file, run once
--   3. Verify with:
--        select table_name from information_schema.tables
--          where table_schema = 'public' order by table_name;
--        -- Expect: admin_users, api_keys, lead_events, leads
--
-- Do NOT use this for incremental migrations on an existing DB. For that,
-- run the individual files in supabase/migrations/ in order.
-- =========================================================================


-- -------------------------------------------------------------------------
-- 0001_leads.sql — Base leads table + admin gating (from the old funnel)
-- -------------------------------------------------------------------------
create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  session_id uuid unique,
  motivation text[],
  who_to_protect text[],
  children_count int,
  state text,
  dob date,
  sex_at_birth text,
  tobacco text,
  health_level text,
  term_length int,
  coverage_amount int,
  first_name text,
  last_name text,
  phone text,
  email text,
  consent_at timestamptz,
  is_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_is_complete_idx on public.leads (is_complete);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

alter table public.leads enable row level security;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
drop policy if exists admin_users_self_read on public.admin_users;
create policy admin_users_self_read
  on public.admin_users for select
  using (auth.uid() = user_id);


-- -------------------------------------------------------------------------
-- 0002_quotes_for.sql
-- -------------------------------------------------------------------------
alter table public.leads
  add column if not exists quotes_for text;


-- -------------------------------------------------------------------------
-- 0003_health_lifestyle.sql
-- -------------------------------------------------------------------------
alter table public.leads
  add column if not exists tobacco_last_12mo boolean,
  add column if not exists married boolean,
  add column if not exists medical_treatment_5yr boolean;


-- -------------------------------------------------------------------------
-- 0004_partner_leads.sql — Partner lead receiver
-- -------------------------------------------------------------------------
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  partner_name text not null,
  key_hash text not null unique,
  key_prefix text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz,
  notes text
);
create index if not exists api_keys_active_idx on public.api_keys (is_active) where is_active;
alter table public.api_keys enable row level security;

create table if not exists public.lead_events (
  id uuid primary key default gen_random_uuid(),
  received_at timestamptz not null default now(),
  api_key_id uuid references public.api_keys(id) on delete set null,
  partner_name text,
  source_ip text,
  user_agent text,
  request_headers jsonb,
  raw_payload jsonb not null,
  processing_status text not null default 'received',
  processing_error text,
  lead_id uuid
);
create index if not exists lead_events_received_at_idx on public.lead_events (received_at desc);
create index if not exists lead_events_api_key_idx on public.lead_events (api_key_id);
create index if not exists lead_events_status_idx on public.lead_events (processing_status);
alter table public.lead_events enable row level security;

alter table public.leads
  add column if not exists source text,
  add column if not exists api_key_id uuid references public.api_keys(id) on delete set null,
  add column if not exists vendor_lead_id text,
  add column if not exists is_test boolean not null default false,
  add column if not exists submitted_at timestamptz,
  add column if not exists intent text,
  add column if not exists coverage_unsure boolean,
  add column if not exists zip text,
  add column if not exists street_address text,
  add column if not exists city text,
  add column if not exists consent_given boolean,
  add column if not exists consent_language text,
  add column if not exists consenting_entity text,
  add column if not exists partner_list_version text,
  add column if not exists partner_list_date date,
  add column if not exists trusted_form_cert_url text,
  add column if not exists jornaya_lead_id text,
  add column if not exists consumer_ip text,
  add column if not exists user_agent text,
  add column if not exists landing_page_url text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text;

alter table public.leads alter column session_id drop not null;

create unique index if not exists leads_partner_idempotency_idx
  on public.leads (api_key_id, vendor_lead_id)
  where api_key_id is not null and vendor_lead_id is not null;

create index if not exists leads_source_idx on public.leads (source);
create index if not exists leads_vendor_lead_id_idx on public.leads (vendor_lead_id);
