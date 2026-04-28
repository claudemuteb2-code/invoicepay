"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { CURRENCIES } from "@/lib/currencies";

type Initial = {
  full_name: string;
  company_name: string;
  address: string;
  phone: string;
  paypal_email: string;
  email: string;
  default_currency: string;
  default_tax_rate: number;
  default_payment_terms: string;
  invoice_prefix: string;
  invoice_footer: string;
};

const TERMS = [
  { value: "due_on_receipt", label: "Due on receipt" },
  { value: "net_7", label: "Net 7" },
  { value: "net_15", label: "Net 15" },
  { value: "net_30", label: "Net 30" },
  { value: "net_60", label: "Net 60" },
  { value: "custom", label: "Custom" },
];

export default function SettingsForm({ initial }: { initial: Initial }) {
  const [v, setV] = useState<Initial>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function set<K extends keyof Initial>(key: K, value: Initial[K]) {
    setV((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setErr(null);
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: v.full_name || null,
        company_name: v.company_name || null,
        address: v.address || null,
        phone: v.phone || null,
        paypal_email: v.paypal_email || null,
        default_currency: v.default_currency,
        default_tax_rate: Number(v.default_tax_rate) || 0,
        default_payment_terms: v.default_payment_terms,
        invoice_prefix: v.invoice_prefix || "INV",
        invoice_footer: v.invoice_footer || null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) setErr(error.message);
    else setMsg("Saved.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="card space-y-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Profile &amp; company
        </h2>
        <div>
          <label className="label">Email</label>
          <input className="input" value={v.email} disabled />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Your name</label>
            <input
              className="input"
              value={v.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="label">Company / business name</label>
            <input
              className="input"
              value={v.company_name}
              onChange={(e) => set("company_name", e.target.value)}
              placeholder="Appears at the top of invoices"
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              value={v.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
          <div>
            <label className="label">PayPal receiving email</label>
            <input
              type="email"
              className="input"
              value={v.paypal_email}
              onChange={(e) => set("paypal_email", e.target.value)}
              placeholder="you@example.com"
            />
          </div>
        </div>
        <div>
          <label className="label">Address</label>
          <textarea
            className="input min-h-[80px]"
            value={v.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="Street, city, postal code, country"
          />
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Invoice defaults
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="label">Default currency</label>
            <select
              className="input"
              value={v.default_currency}
              onChange={(e) => set("default_currency", e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Default tax rate (%)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className="input"
              value={v.default_tax_rate}
              onChange={(e) =>
                set("default_tax_rate", Number(e.target.value) as Initial["default_tax_rate"])
              }
            />
          </div>
          <div>
            <label className="label">Default payment terms</label>
            <select
              className="input"
              value={v.default_payment_terms}
              onChange={(e) => set("default_payment_terms", e.target.value)}
            >
              {TERMS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Invoice number prefix</label>
            <input
              className="input"
              value={v.invoice_prefix}
              onChange={(e) => set("invoice_prefix", e.target.value)}
              placeholder="INV"
            />
            <p className="mt-1 text-xs text-slate-500">
              Used as the prefix on auto-generated invoice numbers.
            </p>
          </div>
          <div>
            <label className="label">Footer / notes</label>
            <input
              className="input"
              value={v.invoice_footer}
              onChange={(e) => set("invoice_footer", e.target.value)}
              placeholder="Thank you for your business!"
            />
          </div>
        </div>
      </section>

      {err && (
        <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {err}
        </p>
      )}
      {msg && (
        <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          {msg}
        </p>
      )}

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
