import type { TemplateId } from "@/lib/templates";

export type InvoiceItem = {
  description: string;
  quantity: number;
  rate: number;
};

export type Invoice = {
  id: string;
  user_id: string;
  public_token: string;
  number: string;
  status: "draft" | "sent" | "paid";
  client_name: string;
  client_email: string | null;
  currency: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  due_date: string | null;
  paid_at: string | null;
  paypal_capture_id: string | null;
  template: TemplateId;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  email: string;
  business_name: string | null;
  paypal_email: string | null;
  plan: "free" | "pro";
  paypal_subscription_id: string | null;
  subscription_status: string | null;
  subscription_current_period_end: string | null;
};
