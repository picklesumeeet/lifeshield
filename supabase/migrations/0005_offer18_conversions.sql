-- Offer18 conversion callbacks: capture vendor tracking id on inbound leads,
-- and keep an audit trail of every conversion postback we fire.

alter table public.leads
  add column if not exists tid text,
  add column if not exists adv_sub1 text,
  add column if not exists adv_sub2 text,
  add column if not exists adv_sub3 text,
  add column if not exists adv_sub4 text,
  add column if not exists adv_sub5 text;

create index if not exists leads_tid_idx on public.leads (tid) where tid is not null;

create table if not exists public.offer18_postbacks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  tid text not null,
  status text not null,           -- '1' approve, '3' reject
  event text,
  request_body jsonb not null,
  response_status int,
  response_body text,
  error text,
  attempted_at timestamptz not null default now()
);
create index if not exists offer18_postbacks_lead_idx on public.offer18_postbacks (lead_id);
create index if not exists offer18_postbacks_tid_idx on public.offer18_postbacks (tid);
create index if not exists offer18_postbacks_attempted_at_idx on public.offer18_postbacks (attempted_at desc);
alter table public.offer18_postbacks enable row level security;
