import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatMoney } from "@/lib/utils";
import type { Invoice } from "@/types/db";
import PayPalCheckout from "./PayPalCheckout";

export const dynamic = "force-dynamic";

export default async function PublicInvoicePage({
  params,
}: {
  params: { token: string };
}) {
  const admin = createSupabaseAdminClient();
  const { data: invoice } = await admin
    .from("invoices")
    .select("*")
    .eq("public_token", params.token)
    .single();
  if (!invoice) notFound();
  const inv = invoice as Invoice;

  const { data: profile } = await admin
    .from("profiles")
    .select("business_name, email")
    .eq("id", inv.user_id)
    .single();

  const businessName =
    profile?.business_name || profile?.email || "InvoicePay user";
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-2xl px-6">
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase text-slate-500">Invoice</p>
              <h1 className="text-2xl font-bold">{inv.number}</h1>
              <p className="text-sm text-slate-600">from {businessName}</p>
            </div>
            <div className="text-right">
              <StatusBadge status={inv.status} />
              {inv.due_date && inv.status !== "paid" && (
                <p className="mt-1 text-xs text-slate-500">
                  Due {new Date(inv.due_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <p className="text-xs uppercase text-slate-500">Bill to</p>
            <p className="font-semibold">{inv.client_name}</p>
            {inv.client_email && (
              <p className="text-sm text-slate-600">{inv.client_email}</p>
            )}
          </div>

          <table className="mt-6 w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Description</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Rate</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {inv.items.map((it, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="py-2">{it.description}</td>
                  <td className="py-2 text-right">{it.quantity}</td>
                  <td className="py-2 text-right">
                    {formatMoney(Number(it.rate), inv.currency)}
                  </td>
                  <td className="py-2 text-right">
                    {formatMoney(
                      Number(it.quantity) * Number(it.rate),
                      inv.currency,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex flex-col items-end gap-1 text-sm">
            <div>
              Subtotal: {formatMoney(Number(inv.subtotal), inv.currency)}
            </div>
            <div>
              Tax ({inv.tax_rate}%):{" "}
              {formatMoney(Number(inv.tax_amount), inv.currency)}
            </div>
            <div className="text-2xl font-bold">
              {formatMoney(Number(inv.total), inv.currency)}
            </div>
          </div>

          {inv.notes && (
            <p className="mt-6 whitespace-pre-wrap border-t border-slate-200 pt-4 text-sm text-slate-600">
              {inv.notes}
            </p>
          )}

          <div className="mt-6 border-t border-slate-200 pt-6">
            {inv.status === "paid" ? (
              <div className="rounded-md bg-emerald-50 p-4 text-sm text-emerald-800">
                This invoice has been paid
                {inv.paid_at && (
                  <> on {new Date(inv.paid_at).toLocaleDateString()}</>
                )}
                . Thank you!
              </div>
            ) : (
              <>
                <p className="mb-3 text-sm text-slate-600">
                  Pay securely with PayPal. No account required — pay as guest
                  with a card too.
                </p>
                {clientId ? (
                  <PayPalCheckout
                    token={inv.public_token}
                    clientId={clientId}
                    currency={inv.currency}
                  />
                ) : (
                  <div className="rounded bg-amber-50 p-3 text-xs text-amber-800">
                    PayPal not configured yet. Ask the sender to contact you
                    for payment instructions.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">
          Powered by InvoicePay
        </p>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    sent: "bg-blue-100 text-blue-700",
    paid: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-semibold ${
        map[status] || map.draft
      }`}
    >
      {status.toUpperCase()}
    </span>
  );
}
