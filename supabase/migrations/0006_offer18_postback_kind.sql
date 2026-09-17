-- Extend offer18_postbacks so we can audit both flavors of outbound call:
--   'postback'          — GET the merchant's Offer18 postback URL to CREATE a conversion
--   'conversion_status' — POST to /api/m/conversion to approve or reject an existing one
--
-- Also relax status to nullable — the postback flow doesn't send a status field.

alter table public.offer18_postbacks
  add column if not exists kind text not null default 'conversion_status',
  add column if not exists url text;

alter table public.offer18_postbacks
  alter column status drop not null;

create index if not exists offer18_postbacks_kind_idx on public.offer18_postbacks (kind);
