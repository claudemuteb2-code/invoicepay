/**
 * InvoiceFlow plan tiers.
 *
 * - `free`     — $0/month
 * - `starter`  — $12/month (PayPal subscription)
 * - `pro`      — $29/month (PayPal subscription)
 * - `business` — $79/month (PayPal subscription)
 *
 * Limits are checked server-side in the API routes. UI gates are advisory.
 */

export type PlanId = "free" | "starter" | "pro" | "business";

export type PlanLimits = {
  /** Maximum number of *active* (non-archived) clients. null = unlimited. */
  maxActiveClients: number | null;
  /** Maximum invoices in a calendar month. null = unlimited. */
  maxInvoicesPerMonth: number | null;
  /** Number of templates the user can pick from. */
  templateCount: number;
  /** Whether the InvoiceFlow watermark is removed from PDFs. */
  removeWatermark: boolean;
  /** Whether the public PayPal "Pay" button shows on invoices. */
  paypalPayOnInvoice: boolean;
  /** Whether the user can send manual payment reminders. */
  manualReminders: boolean;
  /** Whether automatic overdue reminders are scheduled. */
  autoReminders: boolean;
  /** Whether recurring invoice schedules are available. */
  recurring: boolean;
  /** Whether the reports module (Recharts) is available. */
  reports: boolean;
  /** Multi-currency selector with locale formatting. */
  multiCurrency: boolean;
  /** Custom logo + brand colour on PDFs. */
  customBranding: boolean;
  /** Maximum team members (including owner). 1 = solo only. */
  maxTeamMembers: number;
  /** Whether the public REST API is available. */
  apiAccess: boolean;
  /** Whether all InvoiceFlow branding is removed (white-label). */
  whiteLabel: boolean;
};

export type PlanMeta = {
  id: PlanId;
  name: string;
  /** USD price per month. 0 for free. */
  priceMonthly: number;
  description: string;
  highlights: string[];
  ctaLabel: string;
  /** Marketing-only "most popular" badge. */
  recommended?: boolean;
  limits: PlanLimits;
};

export const PLANS: Record<PlanId, PlanMeta> = {
  free: {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    description: "Try InvoiceFlow for as long as you want.",
    highlights: [
      "Up to 3 active clients",
      "5 invoices per month",
      "Classic template",
      "PDF export with watermark",
      "Email support",
    ],
    ctaLabel: "Start free",
    limits: {
      maxActiveClients: 3,
      maxInvoicesPerMonth: 5,
      templateCount: 1,
      removeWatermark: false,
      paypalPayOnInvoice: false,
      manualReminders: false,
      autoReminders: false,
      recurring: false,
      reports: false,
      multiCurrency: false,
      customBranding: false,
      maxTeamMembers: 1,
      apiAccess: false,
      whiteLabel: false,
    },
  },
  starter: {
    id: "starter",
    name: "Starter",
    priceMonthly: 12,
    description: "For freelancers ready to get paid online.",
    highlights: [
      "Up to 25 clients",
      "50 invoices per month",
      "3 templates",
      "PDF without watermark",
      "PayPal pay button on invoices",
      "Manual reminders",
      "Priority email support",
    ],
    ctaLabel: "Choose Starter",
    limits: {
      maxActiveClients: 25,
      maxInvoicesPerMonth: 50,
      templateCount: 3,
      removeWatermark: true,
      paypalPayOnInvoice: true,
      manualReminders: true,
      autoReminders: false,
      recurring: false,
      reports: false,
      multiCurrency: false,
      customBranding: false,
      maxTeamMembers: 1,
      apiAccess: false,
      whiteLabel: false,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 29,
    description: "Everything you need to scale a small business.",
    highlights: [
      "Unlimited clients & invoices",
      "6 templates + colour customisation",
      "Custom logo & branding",
      "Automatic payment reminders",
      "Recurring invoices",
      "Multi-currency",
      "Advanced reports + CSV/PDF export",
      "Priority chat support",
    ],
    ctaLabel: "Choose Pro",
    recommended: true,
    limits: {
      maxActiveClients: null,
      maxInvoicesPerMonth: null,
      templateCount: 6,
      removeWatermark: true,
      paypalPayOnInvoice: true,
      manualReminders: true,
      autoReminders: true,
      recurring: true,
      reports: true,
      multiCurrency: true,
      customBranding: true,
      maxTeamMembers: 1,
      apiAccess: false,
      whiteLabel: false,
    },
  },
  business: {
    id: "business",
    name: "Business",
    priceMonthly: 79,
    description: "Teams and agencies that bill at scale.",
    highlights: [
      "Everything in Pro",
      "Up to 5 team members with roles",
      "Client portal",
      "REST API access",
      "White-label PDFs",
      "Dedicated account manager",
      "99.9% uptime SLA",
    ],
    ctaLabel: "Choose Business",
    limits: {
      maxActiveClients: null,
      maxInvoicesPerMonth: null,
      templateCount: 6,
      removeWatermark: true,
      paypalPayOnInvoice: true,
      manualReminders: true,
      autoReminders: true,
      recurring: true,
      reports: true,
      multiCurrency: true,
      customBranding: true,
      maxTeamMembers: 5,
      apiAccess: true,
      whiteLabel: true,
    },
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "starter", "pro", "business"];

export function getPlan(id: string | null | undefined): PlanMeta {
  return PLANS[(id ?? "free") as PlanId] ?? PLANS.free;
}

export function getLimits(id: string | null | undefined): PlanLimits {
  return getPlan(id).limits;
}

/** True when planA is at least as high a tier as planB. */
export function planAtLeast(planA: string | null | undefined, planB: PlanId): boolean {
  return PLAN_ORDER.indexOf(getPlan(planA).id) >= PLAN_ORDER.indexOf(planB);
}

/** Format a tier price for display. */
export function formatPlanPrice(p: PlanMeta): string {
  if (p.priceMonthly === 0) return "Free";
  return `$${p.priceMonthly}/mo`;
}

/** Whether the user is on a paid plan (any tier above free). */
export function isPaid(id: string | null | undefined): boolean {
  return getPlan(id).id !== "free";
}
