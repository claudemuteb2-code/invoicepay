import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/utils";
import type { Invoice } from "@/types/db";
import InvoiceActions from "./InvoiceActions";

export const dynamic = "force-dynamic";

export default async function InvoiceDetail({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!invoice) notFound();
  const inv = invoice as Invoice;

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  const publicUrl = `${appUrl}/i/${inv.public_token}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← Back
          </Link>
          <h1 className="mt-2 text-2xl font-bold">Invoice {inv.number}</h1>
          <p className="text-sm text-slate-600">
            Status: <span className="font-semibold">{inv.status}</span>
            {inv.paid_at && (
              <> · paid {new Date(inv.paid_at).toLocaleString()}</>
            )}
          </p>
        </div>
        <InvoiceActions id={inv.id} publicUrl={publicUrl} />
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Bill to</div>
            <div className="font-semibold">{inv.client_name}</div>
            {inv.client_email && (
              <div className="text-sm text-slate-600">{inv.client_email}</div>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">Total</div>
            <div className="text-2xl font-bold">
              {formatMoney(Number(inv.total), inv.currency)}
            </div>
            {inv.due_date && (
              <div className="text-xs text-slate-500">
                Due {new Date(inv.due_date).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        <table className="w-full text-sm">
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
          <div>Subtotal: {formatMoney(Number(inv.subtotal), inv.currency)}</div>
          <div>
            Tax ({inv.tax_rate}%):{" "}
            {formatMoney(Number(inv.tax_amount), inv.currency)}
          </div>
          <div className="text-lg font-bold">
            Total {formatMoney(Number(inv.total), inv.currency)}
          </div>
        </div>

        {inv.notes && (
          <p className="mt-6 whitespace-pre-wrap text-sm text-slate-600">
            {inv.notes}
          </p>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold">Share this invoice</h2>
        <p className="mt-1 text-sm text-slate-600">
          Send this link to your client. They can view the invoice and pay with
          PayPal in one click.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 truncate rounded bg-slate-100 px-3 py-2 text-xs">
            {publicUrl}
          </code>
          <Link href={publicUrl} target="_blank" className="btn-secondary">
            Open
          </Link>
        </div>
      </div>
    </div>
  );
}
