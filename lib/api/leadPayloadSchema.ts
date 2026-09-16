import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const optionalString = z
  .union([z.string(), z.null()])
  .transform((v) => (v == null ? null : v.trim() === "" ? null : v.trim()))
  .nullable()
  .optional();

const boolCoerce = z
  .union([z.boolean(), z.string(), z.number()])
  .transform((v) => {
    if (typeof v === "boolean") return v;
    if (typeof v === "number") return v !== 0;
    const s = v.toLowerCase().trim();
    if (["true", "yes", "y", "1"].includes(s)) return true;
    if (["false", "no", "n", "0"].includes(s)) return false;
    throw new Error(`invalid boolean: ${v}`);
  });

const intCoerce = z.coerce.number().int();

export const leadPayloadSchema = z
  .object({
    // Vendor tracking (required for idempotency).
    vendor_lead_id: nonEmptyString,
    test: boolCoerce.optional().default(false),
    submitted_at: z.string().datetime().optional(),

    // Lead answers.
    intent: z
      .enum(["income", "final_expenses", "mortgage", "leave_behind", "comparing"])
      .optional(),
    coverage_amount: intCoerce.min(0).max(100_000_000).nullable().optional(),
    coverage_unsure: boolCoerce.optional(),
    tobacco_last_12mo: boolCoerce.optional(),
    health_level: z.enum(["excellent", "good", "fair"]).optional(),
    dob: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "dob must be YYYY-MM-DD"),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/, "zip must be 5 or 9 digits"),
    state: z.string().length(2).optional(),
    street_address: optionalString,
    city: optionalString,
    first_name: nonEmptyString.max(80),
    last_name: nonEmptyString.max(80),
    phone: z
      .string()
      .transform((v) => v.replace(/[^\d+]/g, ""))
      .pipe(z.string().min(10).max(16)),
    email: z.email(),

    // TCPA consent.
    consent_given: boolCoerce,
    consent_at: z.string().datetime(),
    consent_language: nonEmptyString.max(4000),
    consenting_entity: optionalString,
    partner_list_version: optionalString,
    partner_list_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
    trusted_form_cert_url: z.url().optional(),
    jornaya_lead_id: optionalString,

    // Context.
    consumer_ip: optionalString,
    user_agent: optionalString,
    landing_page_url: optionalString,
    utm_source: optionalString,
    utm_medium: optionalString,
    utm_campaign: optionalString,
    utm_content: optionalString,
    utm_term: optionalString,

    // Offer18 tracking. `tid` is the click/transaction id from Offer18; when
    // present on a stored lead we fire an approve conversion callback.
    tid: optionalString,
    adv_sub1: optionalString,
    adv_sub2: optionalString,
    adv_sub3: optionalString,
    adv_sub4: optionalString,
    adv_sub5: optionalString,
  })
  .refine((v) => v.consent_given === true, {
    path: ["consent_given"],
    message: "consent_given must be true",
  });

export type LeadPayload = z.infer<typeof leadPayloadSchema>;
