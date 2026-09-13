export type LeadRow = {
  id: string;
  session_id: string | null;
  motivation: string[] | null;
  quotes_for: string | null;
  who_to_protect: string[] | null;
  children_count: number | null;
  state: string | null;
  dob: string | null;
  sex_at_birth: string | null;
  tobacco: string | null;
  health_level: string | null;
  tobacco_last_12mo: boolean | null;
  married: boolean | null;
  medical_treatment_5yr: boolean | null;
  term_length: number | null;
  coverage_amount: number | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  consent_at: string | null;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
  // Partner-receiver fields (0004_partner_leads.sql).
  source: string | null;
  api_key_id: string | null;
  vendor_lead_id: string | null;
  is_test: boolean;
  submitted_at: string | null;
  intent: string | null;
  coverage_unsure: boolean | null;
  zip: string | null;
  street_address: string | null;
  city: string | null;
  consent_given: boolean | null;
  consent_language: string | null;
  consenting_entity: string | null;
  partner_list_version: string | null;
  partner_list_date: string | null;
  trusted_form_cert_url: string | null;
  jornaya_lead_id: string | null;
  consumer_ip: string | null;
  user_agent: string | null;
  landing_page_url: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
};

export type LeadInsert = Partial<LeadRow>;

export type AdminUserRow = {
  user_id: string;
  created_at: string;
};

export type ApiKeyRow = {
  id: string;
  partner_name: string;
  key_hash: string;
  key_prefix: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
  notes: string | null;
};

export type LeadEventRow = {
  id: string;
  received_at: string;
  api_key_id: string | null;
  partner_name: string | null;
  source_ip: string | null;
  user_agent: string | null;
  request_headers: Record<string, string> | null;
  raw_payload: unknown;
  processing_status: string;
  processing_error: string | null;
  lead_id: string | null;
};

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: LeadRow;
        Insert: LeadInsert;
        Update: Partial<LeadRow>;
        Relationships: [];
      };
      admin_users: {
        Row: AdminUserRow;
        Insert: { user_id: string };
        Update: Partial<AdminUserRow>;
        Relationships: [];
      };
      api_keys: {
        Row: ApiKeyRow;
        Insert: Partial<ApiKeyRow> & {
          partner_name: string;
          key_hash: string;
          key_prefix: string;
        };
        Update: Partial<ApiKeyRow>;
        Relationships: [];
      };
      lead_events: {
        Row: LeadEventRow;
        Insert: Partial<LeadEventRow> & { raw_payload: unknown };
        Update: Partial<LeadEventRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
