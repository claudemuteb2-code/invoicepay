"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  initial: { business_name: string; paypal_email: string; email: string };
};

export default function SettingsForm({ initial }: Props) {
  const [businessName, setBusinessName] = useState(initial.business_name);
  const [paypalEmail, setPaypalEmail] = useState(initial.paypal_email);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        business_name: businessName || null,
        paypal_email: paypalEmail || null,
      })
      .eq("id", user.id);
    setSaving(false);
    setMsg(error ? error.message : "Saved.");
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <div>
        <label className="label">Email</label>
        <input className="input" value={initial.email} disabled />
      </div>
      <div>
        <label className="label">Business name</label>
        <input
          className="input"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Appears on invoices"
        />
      </div>
      <div>
        <label className="label">PayPal receiving email</label>
        <input
          type="email"
          className="input"
          value={paypalEmail}
          onChange={(e) => setPaypalEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <p className="mt-1 text-xs text-slate-500">
          Optional. If set, client payments on your invoices are routed to this
          PayPal account. If empty, payments go to the account configured in
          the platform's PayPal app.
        </p>
      </div>
      {msg && <p className="text-sm text-emerald-700">{msg}</p>}
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
