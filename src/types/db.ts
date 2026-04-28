import type { TemplateId } from "@/lib/templates";
import type { PlanId } from "@/lib/plans";

export type InvoiceItem = {
  description: string;
  quantity: number;
  rate: number;
  /** Per-line tax rate, percent. Defaults to 0. */
  tax_rate?: number;
};

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "paid"
  | "overdue"
  | "cancelled";

export type EstimateStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "declined"
  | "expired";

export type PaymentTerm =
  | "due_on_receipt"
  | "net_7"
  | "net_15"
  | "net_30"
  | "net_60"
  | "custom";

export type Invoice = {
  id: string;
  user_id: string;
  client_id: string | null;
  public_token: string;
  number: string;
  status: InvoiceStatus;
  client_name: string;
  client_email: string | null;
  client_address: string | null;
  currency: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  issue_date: string;
  due_date: string | null;
  payment_terms: PaymentTerm;
  notes: string | null;
  template: TemplateId;
  sent_at: string | null;
  viewed_at: string | null;
  paid_at: string | null;
  paypal_capture_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Estimate = {
  id: string;
  user_id: string;
  client_id: string | null;
  public_token: string;
  number: string;
  status: EstimateStatus;
  client_name: string;
  client_email: string | null;
  client_address: string | null;
  currency: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_amount: number;
  total: number;
  issue_date: string;
  expiry_date: string | null;
  notes: string | null;
  template: TemplateId;
  converted_invoice_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Client = {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  currency: string;
  notes: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

export type RecurringSchedule = {
  id: string;
  user_id: string;
  template_invoice_id: string;
  frequency: "weekly" | "monthly" | "quarterly" | "yearly";
  start_date: string;
  end_date: string | null;
  next_run_at: string;
  auto_send: boolean;
  active: boolean;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  invoice_id: string;
  user_id: string;
  amount: number;
  currency: string;
  method: "paypal" | "manual";
  paypal_transaction_id: string | null;
  paid_at: string;
  created_at: string;
};

export type TeamMember = {
  id: string;
  workspace_owner_id: string;
  user_id: string | null;
  invited_email: string;
  role: "owner" | "admin" | "member";
  status: "pending" | "active" | "revoked";
  invited_at: string;
  joined_at: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  default_currency: string;
  default_tax_rate: number;
  default_payment_terms: PaymentTerm;
  invoice_prefix: string;
  invoice_footer: string | null;
  reply_to_email: string | null;
  email_signature: string | null;
  plan: PlanId;
  paypal_subscription_id: string | null;
  paypal_plan_id: string | null;
  subscription_status: string | null;
  subscription_current_period_end: string | null;
  paypal_email: string | null;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
};
