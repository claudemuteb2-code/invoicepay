"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { computeInvoiceTotals, formatMoney } from "@/lib/utils";
import type { Invoice, InvoiceItem } from "@/types/db";

type Props = {
  initial?: Partial<Invoice>;
};

export default function InvoiceForm({ initial }: Props) {
  const router = useRouter();
  const [clientName, setClientName] = useState(initial?.client_name ?? "");
  const [clientEmail, setClientEmail] = useState(initial?.client_email ?? "");
  const [currency, setCurrency] = useState(initial?.currency ?? "USD");
  const [taxRate, setTaxRate] = useState<number>(Number(initial?.tax_rate ?? 0));
  const [dueDate, setDueDate] = useState(initial?.due_date ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [items, setItems] = useState<InvoiceItem[]>(
    (initial?.items as InvoiceItem[]) ?? [
      { description: "", quantity: 1, rate: 0 },
    ],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => computeInvoiceTotals(items, taxRate), [items, taxRate]);

  function updateItem(idx: number, patch: Partial<InvoiceItem>) {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { description: "", quantity: 1, rate: 0 }]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        client_name: clientName,
        client_email: clientEmail || null,
        currency,
        items,
        tax_rate: taxRate,
        due_date: dueDate || null,
        notes: notes || null,
        status: "sent",
      };
      const url = initial?.id ? `/api/invoices/${initial.id}` : "/api/invoices";
      const method = initial?.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save invoice");
      router.push(`/dashboard/invoices/${data.invoice.id}`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">Client</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Client name *</label>
            <input
              className="input"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Client email</label>
            <input
              type="email"
              className="input"
              value={clientEmail ?? ""}
              onChange={(e) => setClientEmail(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Line items</h2>
          <button type="button" onClick={addItem} className="btn-secondary">
            + Add item
          </button>
        </div>
        <div className="space-y-3">
          {items.map((it, idx) => (
            <div
              key={idx}
              className="grid items-end gap-3 md:grid-cols-[1fr_100px_120px_auto]"
            >
              <div>
                <label className="label">Description</label>
                <input
                  className="input"
                  value={it.description}
                  onChange={(e) =>
                    updateItem(idx, { description: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="label">Qty</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="input"
                  value={it.quantity}
                  onChange={(e) =>
                    updateItem(idx, { quantity: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="label">Rate</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="input"
                  value={it.rate}
                  onChange={(e) =>
                    updateItem(idx, { rate: Number(e.target.value) })
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                disabled={items.length === 1}
                className="text-sm text-slate-500 hover:text-red-600 disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Currency</label>
              <select
                className="input"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {["USD", "EUR", "GBP", "CAD", "AUD"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Tax rate (%)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="input"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <label className="label">Due date</label>
            <input
              type="date"
              className="input"
              value={dueDate ?? ""}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input"
              rows={3}
              value={notes ?? ""}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Subtotal</dt>
              <dd>{formatMoney(totals.subtotal, currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Tax ({taxRate}%)</dt>
              <dd>{formatMoney(totals.taxAmount, currency)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatMoney(totals.total, currency)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading
            ? "Saving…"
            : initial?.id
              ? "Save changes"
              : "Create invoice"}
        </button>
      </div>
    </form>
  );
}
