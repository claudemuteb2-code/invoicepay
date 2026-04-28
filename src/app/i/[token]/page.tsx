import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Invoice } from "@/types/db";
import InvoiceRender from "@/components/invoice/InvoiceRender";
import PdfDownloadButton from "@/components/invoice/PdfDownloadButton";
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
    .select("company_name, email")
    .eq("id", inv.user_id)
    .single();

  const businessName =
    profile?.company_name || profile?.email || "InvoiceFlow user";
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  return (
    <main className="min-h-screen bg-slate-100 py-10">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-4 flex items-center justify-between">
          <StatusBadge status={inv.status} />
          <PdfDownloadButton invoice={inv} businessName={businessName} />
        </div>

        <InvoiceRender invoice={inv} businessName={businessName} />

        <div className="card mt-4">
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
                  PayPal not configured yet. Ask the sender to contact you for
                  payment instructions.
                </div>
              )}
            </>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Powered by <span className="font-semibold">InvoiceFlow</span>
        </p>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "bg-slate-200 text-slate-700",
    sent: "bg-blue-100 text-blue-700",
    paid: "bg-emerald-100 text-emerald-800",
  };
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
        map[status] || map.draft
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
