import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { createAdmin } from "@/lib/supabase/admin";
import type { ApiKeyRow } from "@/lib/supabase/types";

const KEY_PREFIX_LIVE = "cq_live_";
const KEY_PREFIX_TEST = "cq_test_";
const KEY_PREFIX_LEN = 12; // characters stored for identification/logging

export type GeneratedKey = {
  plaintext: string;
  hash: string;
  prefix: string;
};

/**
 * Generate a new API key. The plaintext is returned once; only the hash is stored.
 */
export function generateApiKey(env: "live" | "test" = "live"): GeneratedKey {
  const rand = randomBytes(32).toString("base64url");
  const prefix = env === "live" ? KEY_PREFIX_LIVE : KEY_PREFIX_TEST;
  const plaintext = `${prefix}${rand}`;
  return {
    plaintext,
    hash: sha256(plaintext),
    prefix: plaintext.slice(0, KEY_PREFIX_LEN),
  };
}

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

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
  if (
    !presented.startsWith(KEY_PREFIX_LIVE) &&
    !presented.startsWith(KEY_PREFIX_TEST)
  ) {
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

  // Constant-time comparison as belt-and-braces even though we already matched on hash.
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
