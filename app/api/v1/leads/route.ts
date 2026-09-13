import { NextResponse } from "next/server";
import { createAdmin } from "@/lib/supabase/admin";
import { authenticateRequest } from "@/lib/api/apiKeyAuth";
import { leadPayloadSchema } from "@/lib/api/leadPayloadSchema";
import type { LeadInsert } from "@/lib/supabase/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 64 * 1024;

function extractIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? null;
}

function safeHeaders(req: Request): Record<string, string> {
  const out: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (key === "x-api-key" || key === "authorization" || key === "cookie") return;
    out[key] = value;
  });
  return out;
}

export async function POST(req: Request) {
  const supabase = createAdmin();
  const sourceIp = extractIp(req);
  const userAgent = req.headers.get("user-agent");
  const headerSnapshot = safeHeaders(req);

  // 1. Read raw body first. Anything that fails after this still leaves an audit trail.
  const rawText = await req.text().catch(() => "");
  if (rawText.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "payload too large" }, { status: 413 });
  }

  let parsedJson: unknown = null;
  let jsonError: string | null = null;
  try {
    parsedJson = rawText ? JSON.parse(rawText) : null;
  } catch (e) {
    jsonError = (e as Error).message;
  }

  // 2. Authenticate.
  const auth = await authenticateRequest(req);

  // 3. Capture the event unconditionally. If parsing/auth failed, this is our record of it.
  const { data: eventRow, error: eventErr } = await supabase
    .from("lead_events")
    .insert({
      api_key_id: auth.ok ? auth.apiKey.id : null,
      partner_name: auth.ok ? auth.apiKey.partner_name : null,
      source_ip: sourceIp,
      user_agent: userAgent,
      request_headers: headerSnapshot,
      raw_payload: parsedJson ?? { _raw_text: rawText.slice(0, MAX_BODY_BYTES) },
      processing_status: "received",
    })
    .select("id")
    .single();
  if (eventErr) console.error("[leads] lead_events insert failed", eventErr);
  const eventId = eventRow?.id ?? null;

  const finalize = async (
    status: "invalid_json" | "unauthorized" | "invalid_payload" | "stored" | "duplicate" | "error",
    leadId: string | null,
    error?: string,
  ) => {
    if (!eventId) return;
    await supabase
      .from("lead_events")
      .update({ processing_status: status, processing_error: error ?? null, lead_id: leadId })
      .eq("id", eventId);
  };

  if (jsonError) {
    await finalize("invalid_json", null, jsonError);
    return NextResponse.json({ error: "invalid JSON", detail: jsonError }, { status: 400 });
  }
  if (!auth.ok) {
    await finalize("unauthorized", null, auth.error);
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // 4. Validate.
  const parsed = leadPayloadSchema.safeParse(parsedJson);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => ({
      path: i.path.join("."),
      code: i.code,
      message: i.message,
    }));
    await finalize("invalid_payload", null, JSON.stringify(issues));
    return NextResponse.json({ error: "invalid payload", issues }, { status: 400 });
  }
  const payload = parsed.data;

  // 5. Idempotency check on (api_key_id, vendor_lead_id).
  const { data: existing, error: existingErr } = await supabase
    .from("leads")
    .select("id")
    .eq("api_key_id", auth.apiKey.id)
    .eq("vendor_lead_id", payload.vendor_lead_id)
    .maybeSingle();
  if (existingErr) console.error("[leads] idempotency check failed", existingErr);
  if (existing) {
    await finalize("duplicate", existing.id);
    return NextResponse.json(
      { ok: true, lead_id: existing.id, duplicate: true },
      { status: 200 },
    );
  }

  // 6. Insert.
  const row: LeadInsert = {
    source: `partner:${auth.apiKey.partner_name}`,
    api_key_id: auth.apiKey.id,
    vendor_lead_id: payload.vendor_lead_id,
    is_test: payload.test ?? false,
    submitted_at: payload.submitted_at ?? new Date().toISOString(),

    // Lead answers.
    intent: payload.intent ?? null,
    coverage_amount: payload.coverage_amount ?? null,
    coverage_unsure: payload.coverage_unsure ?? null,
    tobacco_last_12mo: payload.tobacco_last_12mo ?? null,
    health_level: payload.health_level ?? null,
    dob: payload.dob,
    zip: payload.zip,
    state: payload.state ?? null,
    street_address: payload.street_address ?? null,
    city: payload.city ?? null,
    first_name: payload.first_name,
    last_name: payload.last_name,
    phone: payload.phone,
    email: payload.email,

    // Consent.
    consent_given: payload.consent_given,
    consent_at: payload.consent_at,
    consent_language: payload.consent_language,
    consenting_entity: payload.consenting_entity ?? null,
    partner_list_version: payload.partner_list_version ?? null,
    partner_list_date: payload.partner_list_date ?? null,
    trusted_form_cert_url: payload.trusted_form_cert_url ?? null,
    jornaya_lead_id: payload.jornaya_lead_id ?? null,

    // Context.
    consumer_ip: payload.consumer_ip ?? sourceIp,
    user_agent: payload.user_agent ?? userAgent,
    landing_page_url: payload.landing_page_url ?? null,
    utm_source: payload.utm_source ?? null,
    utm_medium: payload.utm_medium ?? null,
    utm_campaign: payload.utm_campaign ?? null,
    utm_content: payload.utm_content ?? null,
    utm_term: payload.utm_term ?? null,

    is_complete: true,
  };

  const { data: inserted, error: insertErr } = await supabase
    .from("leads")
    .insert(row)
    .select("id")
    .single();

  if (insertErr) {
    // Race: another request wrote the same (api_key_id, vendor_lead_id) between our check and insert.
    if (insertErr.code === "23505") {
      const { data: raced } = await supabase
        .from("leads")
        .select("id")
        .eq("api_key_id", auth.apiKey.id)
        .eq("vendor_lead_id", payload.vendor_lead_id)
        .maybeSingle();
      if (raced) {
        await finalize("duplicate", raced.id);
        return NextResponse.json(
          { ok: true, lead_id: raced.id, duplicate: true },
          { status: 200 },
        );
      }
    }
    console.error("[leads] insert failed", insertErr);
    await finalize("error", null, insertErr.message);
    return NextResponse.json({ error: "storage failed" }, { status: 500 });
  }

  await finalize("stored", inserted.id);
  return NextResponse.json({ ok: true, lead_id: inserted.id }, { status: 200 });
}
