---
title: CoverageQualifier — Partner Lead API
subtitle: Integration Specification v1
author: CoverageQualifier
date: 2026-09-14
version: 1.0
---

# CoverageQualifier — Partner Lead API

**Integration Specification · Version 1.0**

---

## Setup at a glance

Everything you need on one page. Detailed sections follow below.

### Endpoint

| Setting | Value |
|:---|:---|
| **URL** | `https://coveragequalifier.com/api/v1/leads` |
| **Method** | `POST` |
| **Content-Type** | `application/json` |
| **Max body size** | 64 KB |

### Authentication

Add your issued key as an HTTP header:

```
x-api-key: cq_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

- Production keys start with `cq_live_`.
- Sandbox keys start with `cq_test_` — leads posted with a test key are stored with `is_test = true` and are excluded from downstream distribution, billing, and reporting.
- Keys are issued directly by CoverageQualifier. Do not embed in client-side code or public repos.

### Required fields — lead identity

- `vendor_lead_id` — your unique, stable id for the lead (idempotency key)
- `first_name`, `last_name`
- `email`, `phone`
- `dob` (`YYYY-MM-DD`)
- `zip` (5 or 9 digits)

### Required fields — TCPA compliance

All three are hard-required. Requests missing any of these are rejected with `400`.

- `consent_given` — must be `true`
- `consent_at` — UTC ISO 8601 timestamp of the moment the consumer submitted
- `consent_language` — verbatim wording shown to the consumer

### Strongly required — TCPA compliance (life insurance)

Schema-optional but treated as required in practice. Leads missing these may be devalued or rejected during downstream review.

- `trusted_form_cert_url` — TrustedForm certificate URL
- `jornaya_lead_id` — Jornaya (LeadiD) token
- `consumer_ip` — consumer's IP at submission (falls back to request IP if omitted)
- `user_agent` — consumer's browser UA
- `landing_page_url` — full URL of the submission page
- `consenting_entity` — legal entity named in the consent language (e.g. `LifeShield Group LLC`)
- `partner_list_version` — version identifier of the partner list in effect at submission
- `partner_list_date` — effective date of that partner list version (`YYYY-MM-DD`)

### Offer18 tracking (recommended)

If the user arrived through an Offer18-tracked click, Offer18 appends `click_id` to your funnel's landing URL. Capture it and pass it back in the lead POST so we can auto-fire the Offer18 conversion postback.

- Field name: **`tid`** (`click_id` is also accepted as an alias)
- Only live leads with a `tid` trigger the postback. Test leads and duplicates never do.
- Postback failures do not fail the lead — it still stores and returns `200`.

### Minimal working example

```bash
curl -X POST https://coveragequalifier.com/api/v1/leads \
  -H "Content-Type: application/json" \
  -H "x-api-key: cq_live_YOUR_KEY" \
  -d '{
    "vendor_lead_id": "abc-123",

    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@example.com",
    "phone": "+19195551234",
    "dob": "1990-01-15",
    "zip": "78701",

    "consent_given": true,
    "consent_at": "2026-09-17T15:30:00Z",
    "consent_language": "<verbatim consent text shown to consumer>",
    "consenting_entity": "LifeShield Group LLC",
    "partner_list_version": "v2",
    "partner_list_date": "2026-09-07",
    "trusted_form_cert_url": "https://cert.trustedform.com/abc123",
    "jornaya_lead_id": "12345678-1234-1234-1234-123456789012",

    "consumer_ip": "203.0.113.12",
    "user_agent": "Mozilla/5.0",
    "landing_page_url": "https://coveragequalifier.com/quote?click_id=D-...",

    "tid": "D-22030402-1789576922-34G21G2G137-EVDLC9850"
  }'
```

### Expected responses

**New lead accepted (`200`):**
```json
{ "ok": true, "lead_id": "8e2a1c7f-4d1a-4e7d-9b60-4d3f5c9a1b2e" }
```

**Duplicate — same `vendor_lead_id` under your key (`200`):**
```json
{ "ok": true, "lead_id": "8e2a1c7f-...", "duplicate": true }
```

**Validation failure (`400`):**
```json
{ "error": "invalid payload", "issues": [{ "path": "email", "code": "invalid_string", "message": "Invalid email" }] }
```

See §6 for the complete response contract, §7 for idempotency semantics, and §9 for compliance details.

---

## 1. Overview

This document describes the HTTP API for posting qualified life-insurance leads to CoverageQualifier. Partners integrate by making authenticated `POST` requests to a single endpoint. Each accepted lead is stored in our system of record, deduplicated, and made available for downstream distribution.

**Design principles:**

- **Raw first, validate second.** Every request is captured to an audit log before validation runs. This means failed requests are still recoverable.
- **Idempotent.** Retrying the same lead never produces duplicates.
- **Contract-versioned.** Breaking changes to the payload will introduce `/api/v2/leads`, not modify `v1`.

---

## 2. Endpoint

| Environment | URL |
|:---|:---|
| **Production** | `https://coveragequalifier.com/api/v1/leads` |
| **Development** *(if provided)* | *shared separately* |

**Method:** `POST`
**Content-Type:** `application/json`
**Character encoding:** UTF-8
**Max body size:** 64 KB

---

## 3. Authentication

Every request must include a valid API key in the `x-api-key` header.

### 3.1 Key format

Keys are opaque strings with an environment prefix:

- `cq_live_…` — production keys (real leads)
- `cq_test_…` — sandbox keys for integration testing

### 3.2 Header

```
x-api-key: cq_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 3.3 Key handling

- We store only a hash of the key — we cannot recover a lost key. If lost, request a rotation.
- Keys must be transmitted over TLS 1.2+ (enforced at the endpoint).
- Do not embed keys in client-side code, mobile apps, or public repositories.
- Rotation on request: we can issue a new key and revoke the old one with a 24-hour overlap.

### 3.4 Test key behavior

Leads posted with a `cq_test_…` key are stored with `is_test = true` in our database and are excluded from all downstream distribution, billing, and reporting.

---

## 4. Request payload

### 4.1 Required fields

| Field | Type | Description |
|:---|:---|:---|
| `vendor_lead_id` | string | Your unique identifier for this lead. Used for idempotency — see §7. Must be stable across retries of the same lead. |
| `consent_given` | boolean | Must be `true`. Requests where the consumer did not affirmatively consent will be rejected. |
| `consent_at` | ISO 8601 datetime | UTC timestamp of the moment the consumer clicked submit. |
| `consent_language` | string (≤ 4000 chars) | Verbatim consent language shown to the consumer at submission. |
| `first_name` | string (1–80) | Consumer's first name. |
| `last_name` | string (1–80) | Consumer's last name. |
| `email` | string (email) | Valid email address. |
| `phone` | string (10–16 digits after normalization) | E.164 preferred (e.g. `+19195551234`). Common separators are stripped. |
| `dob` | string (`YYYY-MM-DD`) | Consumer's date of birth. |
| `zip` | string (5 or 9 digits) | US ZIP code, `12345` or `12345-6789`. |

### 4.2 Recommended / conditionally required fields

| Field | Type | Description |
|:---|:---|:---|
| `trusted_form_cert_url` | string (URL) | TrustedForm certificate URL for the submission. **Strongly required** for life insurance leads — leads without it may be devalued or rejected during downstream review. |
| `jornaya_lead_id` | string | Jornaya (LeadiD) token for the submission. |
| `consumer_ip` | string | IP address of the consumer at submission. Falls back to request IP if omitted. |
| `user_agent` | string | Consumer's browser user agent. |
| `landing_page_url` | string | Full URL of the page the consumer submitted from. |
| `consenting_entity` | string | Legal entity named in the consent language (e.g. `"LifeShield Group LLC"`). |
| `partner_list_version` | string | Version identifier of the partner list in effect at submission (e.g. `"v2"`). |
| `partner_list_date` | string (`YYYY-MM-DD`) | Effective date of the partner list version. |

### 4.3 Optional lead-answer fields

| Field | Type | Description |
|:---|:---|:---|
| `test` | boolean | Defaults to `false`. Set `true` for integration testing. |
| `submitted_at` | ISO 8601 datetime | Timestamp of submission. Defaults to receipt time if omitted. |
| `intent` | enum | One of: `income`, `final_expenses`, `mortgage`, `leave_behind`, `comparing`. |
| `coverage_amount` | integer | Coverage amount in USD (e.g. `250000`). Nullable if unknown. |
| `coverage_unsure` | boolean | `true` if the consumer selected "Not sure yet." |
| `tobacco_last_12mo` | boolean | Tobacco/nicotine use in the last 12 months. |
| `health_level` | enum | One of: `excellent`, `good`, `fair`. |
| `state` | string (2 chars) | US state code (e.g. `TX`). Derived from ZIP if omitted. |
| `street_address` | string | Consumer's street address. |
| `city` | string | Consumer's city. |
| `utm_source` | string | Marketing attribution. |
| `utm_medium` | string | Marketing attribution. |
| `utm_campaign` | string | Marketing attribution. |
| `utm_content` | string | Marketing attribution. |
| `utm_term` | string | Marketing attribution. |

### 4.4 Offer18 tracking (optional)

If the lead originated from an Offer18-tracked click, include the Offer18 `tid` so we can fire the tracking postback on your behalf. When `tid` is present on a **live** (non-test) lead that we successfully store, we automatically GET the merchant's Offer18 postback URL, which creates the conversion against that click. Every attempt is recorded in our `offer18_postbacks` audit table.

| Field | Type | Description |
|:---|:---|:---|
| `tid` | string | Offer18 click id captured from the tracked landing. **`click_id` is accepted as an alias** — send whichever name you captured from the URL. |
| `adv_sub1` – `adv_sub5` | string | Optional advertiser sub-parameters. Stored on the lead for reporting; not currently forwarded on the postback. |

Rules:

- Test leads (`test: true` or `cq_test_…` key) never trigger an Offer18 postback.
- Duplicate submissions (§7) do not re-fire the postback.
- Postback failures do not fail the lead — the lead is still stored and returned `200`.

---

## 5. Example request

```bash
curl -X POST https://coveragequalifier.com/api/v1/leads \
  -H "Content-Type: application/json" \
  -H "x-api-key: cq_live_YOUR_KEY_HERE" \
  -d '{
    "vendor_lead_id": "sv_01HXYZ123",
    "test": false,
    "submitted_at": "2026-09-14T02:19:00Z",

    "intent": "income",
    "coverage_amount": 250000,
    "coverage_unsure": false,
    "tobacco_last_12mo": false,
    "health_level": "good",

    "dob": "1990-07-27",
    "zip": "78701",
    "state": "TX",
    "street_address": "1420 Cedar Lane",
    "city": "Austin",

    "first_name": "Jordan",
    "last_name": "Reyes",
    "phone": "+19195551234",
    "email": "jordan.reyes@example.com",

    "consent_given": true,
    "consent_at": "2026-09-14T02:19:00Z",
    "consent_language": "I agree to be contacted. By checking this box and clicking Get my quote, I give my express written consent for LifeShield Group LLC and the licensed insurance agents and agencies on its partner list to contact me at the phone number and email I provided, including by automatic telephone dialing system, artificial or prerecorded voice, and text message. Consent is not a condition of purchase.",
    "consenting_entity": "LifeShield Group LLC",
    "partner_list_version": "v2",
    "partner_list_date": "2026-09-07",
    "trusted_form_cert_url": "https://cert.trustedform.com/abc123",
    "jornaya_lead_id": "12345678-1234-1234-1234-123456789012",

    "consumer_ip": "203.0.113.12",
    "user_agent": "Mozilla/5.0",
    "landing_page_url": "https://coveragequalifier.com/quotefc",
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "brand",

    "tid": "D-22030402-1789576922-34G21G2G137-EVDLC9850",
    "adv_sub1": "campaign-abc",
    "adv_sub2": "creative-42"
  }'
```

---

## 6. Response contract

### 6.1 Success — new lead accepted (`200`)

```json
{
  "ok": true,
  "lead_id": "8e2a1c7f-4d1a-4e7d-9b60-4d3f5c9a1b2e"
}
```

Retain `lead_id` for reconciliation. This is our system-of-record identifier for the lead.

### 6.2 Success — duplicate (`200`)

```json
{
  "ok": true,
  "lead_id": "8e2a1c7f-4d1a-4e7d-9b60-4d3f5c9a1b2e",
  "duplicate": true
}
```

Returned when a lead with the same `vendor_lead_id` under the same API key has been previously accepted. `lead_id` matches the original acceptance. **Treat as success.**

### 6.3 Errors

| Status | Meaning | Retry? |
|:---:|:---|:---:|
| `400` | Malformed JSON or payload validation failed | No |
| `401` | Missing, invalid, or revoked API key | No — resolve credentials, then retry |
| `413` | Request body exceeded 64 KB | No |
| `500` | Server-side error on our end | Yes — with backoff |
| `502` / `503` / `504` | Upstream or gateway issue | Yes — with backoff |

### 6.4 Error response shape

```json
{
  "error": "invalid payload",
  "issues": [
    {
      "path": "email",
      "code": "invalid_string",
      "message": "Invalid email"
    },
    {
      "path": "consent_given",
      "code": "custom",
      "message": "consent_given must be true"
    }
  ]
}
```

- `error` — short human-readable summary
- `issues` — present for `400` payload-validation failures; array of per-field problems

---

## 7. Idempotency

Every submitted lead must include a `vendor_lead_id` that is:

- **Unique** across all your leads
- **Stable** across retries of the same lead

We enforce uniqueness on the tuple `(api_key, vendor_lead_id)`. If we receive the same `vendor_lead_id` twice under the same key:

1. The second (and further) requests return `200` with `"duplicate": true`.
2. No new row is created.
3. The `lead_id` returned matches the original acceptance.

This means **safe retries.** If you receive a network timeout or a 5xx response, retry with the identical body and you will not create a duplicate.

---

## 8. Retry policy

**Retry only on:**

- Network errors (timeout, connection refused, DNS failure)
- HTTP `500`, `502`, `503`, `504`

**Do not retry on:**

- HTTP `400` — the payload is invalid; fix and re-submit as a **new** lead
- HTTP `401` — fix credentials, then retry
- HTTP `413` — reduce payload size

**Recommended backoff:**

Exponential with jitter. Suggested: `1s`, `3s`, `10s`, `30s`, then abandon and alert internally. Include the same `vendor_lead_id` on every retry.

---

## 9. TCPA compliance requirements

Leads without a defensible consent record are not commercially valuable to us and may be rejected. **All leads must include:**

- `consent_given: true`
- `consent_at` — UTC timestamp of the click
- `consent_language` — the exact wording shown to the consumer, verbatim

**In addition, we strongly require:**

- `trusted_form_cert_url` — TrustedForm certificate
- `jornaya_lead_id` — Jornaya LeadiD

**For partner-list-based consent (aggregators):**

- `consenting_entity` — the legal entity named in the consent (e.g. `LifeShield Group LLC`)
- `partner_list_version` — the version reference of the partner list in effect
- `partner_list_date` — the effective date of that version

These fields are what allow both parties to defend the lead in a TCPA inquiry. Please treat them as required in practice, even where the schema marks them optional.

---

## 10. Testing

### 10.1 Test key

We will issue a `cq_test_…` key for integration and QA. Leads posted with the test key:

- Are stored with `is_test = true`
- Are not distributed downstream
- Are not counted for billing
- Have no volume limits

### 10.2 Recommended test scenarios

1. **Happy path** — a fully populated valid lead. Expect `200 { ok: true, lead_id }`.
2. **Idempotency** — post the same lead twice. Expect `200 { duplicate: true }` on the second.
3. **Missing consent** — set `consent_given: false`. Expect `400`.
4. **Bad key** — corrupt the header. Expect `401`.
5. **Retry behavior** — simulate a timeout, retry with same body. Expect `200 { duplicate: true }` on the second attempt.

### 10.3 Sign-off

Before switching to the `cq_live_…` key, we ask for a shared review of:

- 5 sample test leads that exercise the scenarios above
- Confirmation of your retry/backoff behavior
- The exact `consent_language` string that will be sent in production

---

## 11. Rate limits

No hard rate limit is enforced at this time. Sustained volumes above ~10 requests per second should be coordinated in advance so we can scale receive capacity accordingly.

---

## 12. Monitoring & incident response

Both sides should monitor:

- **You:** rejection rate (4xx), 5xx rate, and per-lead round-trip latency.
- **Us:** volume drop-off to zero (indicates outage on your side or ours).

If either side observes an anomaly, notify the counterparty within 1 business hour.

---

## 13. Support

**Integration questions, key rotation, incidents:**

- **Email:** *[to be supplied by CoverageQualifier]*
- **Response SLA:** 1 business day for questions, 1 business hour for production incidents

---

## Appendix A — Field reference summary

| Field | Required | Type | Notes |
|:---|:---:|:---|:---|
| `vendor_lead_id` | ✅ | string | Idempotency key |
| `consent_given` | ✅ | bool | Must be `true` |
| `consent_at` | ✅ | ISO datetime | UTC |
| `consent_language` | ✅ | string | Verbatim |
| `first_name` | ✅ | string | 1–80 chars |
| `last_name` | ✅ | string | 1–80 chars |
| `email` | ✅ | email | |
| `phone` | ✅ | string | 10–16 digits after normalization |
| `dob` | ✅ | `YYYY-MM-DD` | |
| `zip` | ✅ | string | 5 or 9 digits |
| `trusted_form_cert_url` | ⚠️ Strong | URL | |
| `jornaya_lead_id` | ⚠️ Strong | string | |
| `consumer_ip` | ⚠️ Strong | string | Falls back to request IP |
| `user_agent` | ⚠️ Strong | string | |
| `landing_page_url` | ⚠️ Strong | URL | |
| `consenting_entity` | ⚠️ Strong | string | |
| `partner_list_version` | ⚠️ Strong | string | |
| `partner_list_date` | ⚠️ Strong | `YYYY-MM-DD` | |
| `test` | ⬜ | bool | Defaults `false` |
| `submitted_at` | ⬜ | ISO datetime | Defaults to receipt time |
| `intent` | ⬜ | enum | income \| final_expenses \| mortgage \| leave_behind \| comparing |
| `coverage_amount` | ⬜ | integer | USD |
| `coverage_unsure` | ⬜ | bool | |
| `tobacco_last_12mo` | ⬜ | bool | |
| `health_level` | ⬜ | enum | excellent \| good \| fair |
| `state` | ⬜ | 2-char code | Derived from ZIP if omitted |
| `street_address` | ⬜ | string | |
| `city` | ⬜ | string | |
| `utm_*` | ⬜ | string | Attribution |
| `tid` | ⬜ | string | Offer18 transaction id — triggers auto-approve conversion callback |
| `adv_sub1`–`adv_sub5` | ⬜ | string | Forwarded to Offer18 with the conversion |

**Legend:** ✅ Required · ⚠️ Strongly recommended · ⬜ Optional

---

## Appendix B — HTTP status quick reference

| Code | Meaning | Action |
|:---:|:---|:---|
| `200` | Accepted (new or duplicate) | Log `lead_id` |
| `400` | Invalid payload | Fix and resubmit as new lead |
| `401` | Auth failure | Check `x-api-key` |
| `413` | Payload too large | Reduce body size |
| `500`, `502`, `503`, `504` | Server / gateway issue | Retry with backoff |

---

*Document version 1.0 · Last updated 2026-09-14*
