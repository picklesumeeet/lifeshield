import "server-only";
import { createAdmin } from "@/lib/supabase/admin";

// The Offer18 conversion endpoint is fixed by the vendor. Auth is a triple of
// merchant id + api key + secret key, all passed as query params.
const OFFER18_CONVERSION_URL = "https://api.offer18.com/api/m/conversion";

export type Offer18Status = "1" | "3"; // 1 = approve, 3 = reject

export type Offer18ConversionInput = {
  tid: string;
  status: Offer18Status;
  event?: string | null;
  adv_sub1?: string | null;
  adv_sub2?: string | null;
  adv_sub3?: string | null;
  adv_sub4?: string | null;
  adv_sub5?: string | null;
  leadId?: string | null;
};

function readCredentials() {
  const mid = process.env.OFFER18_MERCHANT_ID?.trim();
  const apiKey = process.env.OFFER18_API_KEY?.trim();
  const secretKey = process.env.OFFER18_API_SECRET?.trim();
  if (!mid || !apiKey || !secretKey) {
    throw new Error(
      "Offer18 credentials missing: set OFFER18_MERCHANT_ID, OFFER18_API_KEY, OFFER18_API_SECRET",
    );
  }
  return { mid, apiKey, secretKey };
}

function buildBody(input: Offer18ConversionInput): Record<string, string> {
  const body: Record<string, string> = {
    tid: input.tid,
    status: input.status,
  };
  if (input.event) body.event = input.event;
  for (const k of ["adv_sub1", "adv_sub2", "adv_sub3", "adv_sub4", "adv_sub5"] as const) {
    const v = input[k];
    if (v) body[k] = v;
  }
  return body;
}

export async function postOffer18Conversion(input: Offer18ConversionInput) {
  const { mid, apiKey, secretKey } = readCredentials();
  const url = new URL(OFFER18_CONVERSION_URL);
  url.searchParams.set("mid", mid);
  url.searchParams.set("api-key", apiKey);
  url.searchParams.set("secret-key", secretKey);

  const body = buildBody(input);
  const formBody = new URLSearchParams(body).toString();

  const supabase = createAdmin();

  let responseStatus: number | null = null;
  let responseBody: string | null = null;
  let error: string | null = null;

  try {
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody,
    });
    responseStatus = res.status;
    responseBody = (await res.text()).slice(0, 4000);
    if (!res.ok) error = `offer18 responded ${res.status}`;
  } catch (e) {
    error = (e as Error).message;
  }

  const { error: auditErr } = await supabase.from("offer18_postbacks").insert({
    lead_id: input.leadId ?? null,
    tid: input.tid,
    status: input.status,
    event: input.event ?? null,
    request_body: body,
    response_status: responseStatus,
    response_body: responseBody,
    error,
  });
  if (auditErr) console.error("[offer18] postback audit insert failed", auditErr);

  return { ok: !error, responseStatus, responseBody, error };
}
