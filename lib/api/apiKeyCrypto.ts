import { createHash, randomBytes } from "node:crypto";

const KEY_PREFIX_LIVE = "cq_live_";
const KEY_PREFIX_TEST = "cq_test_";
const KEY_PREFIX_LEN = 12;

export type GeneratedKey = {
  plaintext: string;
  hash: string;
  prefix: string;
};

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

export function isValidKeyFormat(key: string): boolean {
  return key.startsWith(KEY_PREFIX_LIVE) || key.startsWith(KEY_PREFIX_TEST);
}
