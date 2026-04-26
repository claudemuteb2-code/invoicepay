import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Invoice } from "@/types/db";
import { getTemplate } from "@/lib/templates";
import InvoiceRender from "@/components/invoice/InvoiceRender";
import PdfDownloadButton from "@/components/invoice/PdfDownloadButton";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name, email")
    .eq("id", user.id)
    .single();

  const businessName =
    profile?.business_name || profile?.email || "InvoicePay user";

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  const publicUrl = `${appUrl}/i/${inv.public_token}`;
  const template = getTemplate(inv.template);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← Back
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Invoice {inv.number}
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
            <StatusBadge status={inv.status} />
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: template.accent }}
              />
              {template.name}
            </span>
            {inv.paid_at && (
              <span className="text-xs text-slate-500">
                · paid {new Date(inv.paid_at).toLocaleString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PdfDownloadButton invoice={inv} businessName={businessName} />
          <InvoiceActions id={inv.id} publicUrl={publicUrl} />
        </div>
      </div>

      <InvoiceRender invoice={inv} businessName={businessName} />

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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    sent: "bg-blue-100 text-blue-700",
    paid: "bg-emerald-100 text-emerald-800",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
        map[status] || map.draft
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
