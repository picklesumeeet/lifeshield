-- Partner lead receiver: api keys, raw event capture, and vendor-facing lead columns.

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

-- Extend leads with vendor-facing fields.
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

-- session_id is required by the old funnel schema but vendor posts have no session; make it nullable.
alter table public.leads alter column session_id drop not null;

-- Idempotency: a single (api_key, vendor_lead_id) tuple should map to one lead row.
-- Partial unique index so old own-funnel rows (api_key_id null) are unaffected.
create unique index if not exists leads_partner_idempotency_idx
  on public.leads (api_key_id, vendor_lead_id)
  where api_key_id is not null and vendor_lead_id is not null;

create index if not exists leads_source_idx on public.leads (source);
create index if not exists leads_vendor_lead_id_idx on public.leads (vendor_lead_id);
