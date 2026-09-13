/**
 * Generate a partner API key and insert its hash into public.api_keys.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/generate-api-key.ts "Partner Name" [live|test] [--notes="..."]
 *
 * Prints the plaintext key ONCE. Save it — it cannot be recovered from the database.
 */
import { createClient } from "@supabase/supabase-js";
import { generateApiKey } from "../lib/api/apiKeyCrypto";
import type { Database } from "../lib/supabase/types";

async function main() {
  const [, , rawName, rawEnv, ...rest] = process.argv;
  if (!rawName) {
    console.error(
      'Usage: npx tsx --env-file=.env.local scripts/generate-api-key.ts "Partner Name" [live|test] [--notes="..."]',
    );
    process.exit(1);
  }
  const env = rawEnv === "test" ? "test" : "live";
  const notes = rest.find((a) => a.startsWith("--notes="))?.slice("--notes=".length) ?? null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Run with --env-file=.env.local",
    );
    process.exit(1);
  }

  const supabase = createClient<Database>(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const key = generateApiKey(env);
  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      partner_name: rawName,
      key_hash: key.hash,
      key_prefix: key.prefix,
      notes,
    })
    .select("id, partner_name, key_prefix, created_at")
    .single();
  if (error) {
    console.error("insert failed:", error.message);
    process.exit(1);
  }

  console.log("");
  console.log("API key created — SAVE THIS NOW, it will not be shown again:");
  console.log("");
  console.log("  ", key.plaintext);
  console.log("");
  console.log("Row:", data);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
