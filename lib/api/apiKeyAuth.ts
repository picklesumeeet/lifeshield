import "server-only";
import { timingSafeEqual } from "node:crypto";
import { createAdmin } from "@/lib/supabase/admin";
import type { ApiKeyRow } from "@/lib/supabase/types";
import { sha256, isValidKeyFormat } from "./apiKeyCrypto";

export { generateApiKey, sha256 } from "./apiKeyCrypto";
export type { GeneratedKey } from "./apiKeyCrypto";

export type AuthResult =
  | { ok: true; apiKey: ApiKeyRow }
  | { ok: false; status: 401; error: string };

/**
 * Authenticate an incoming request by its x-api-key header.
 * On success, updates last_used_at asynchronously (fire-and-forget).
 */
export async function authenticateRequest(req: Request): Promise<AuthResult> {
  const presented = req.headers.get("x-api-key")?.trim();
  if (!presented) {
    return { ok: false, status: 401, error: "missing x-api-key header" };
  }
  if (!isValidKeyFormat(presented)) {
    return { ok: false, status: 401, error: "invalid key format" };
  }

  const hash = sha256(presented);
  const supabase = createAdmin();
  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("key_hash", hash)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[apiKeyAuth] lookup error", error);
    return { ok: false, status: 401, error: "auth lookup failed" };
  }
  if (!data) {
    return { ok: false, status: 401, error: "invalid or revoked key" };
  }

  const rowHashBuf = Buffer.from(data.key_hash, "hex");
  const presentedHashBuf = Buffer.from(hash, "hex");
  if (
    rowHashBuf.length !== presentedHashBuf.length ||
    !timingSafeEqual(rowHashBuf, presentedHashBuf)
  ) {
    return { ok: false, status: 401, error: "invalid or revoked key" };
  }

  supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id)
    .then(({ error: e }) => {
      if (e) console.error("[apiKeyAuth] last_used_at update failed", e);
    });

  return { ok: true, apiKey: data };
}
