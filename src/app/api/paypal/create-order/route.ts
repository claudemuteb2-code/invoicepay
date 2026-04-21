import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createInvoiceOrder } from "@/lib/paypal";

/**
 * Public endpoint used by the shareable invoice page to start a PayPal
 * checkout. Looks up the invoice by its public token (no auth needed).
 */
export async function POST(req: NextRequest) {
  const { token } = (await req.json()) as { token?: string };
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: invoice, error } = await admin
    .from("invoices")
    .select("id, number, total, currency, status, public_token, user_id")
    .eq("public_token", token)
    .single();
  if (error || !invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }
  if (invoice.status === "paid") {
    return NextResponse.json(
      { error: "This invoice has already been paid." },
      { status: 409 },
    );
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("paypal_email")
    .eq("id", invoice.user_id)
    .single();

  const order = await createInvoiceOrder({
    amount: Number(invoice.total).toFixed(2),
    currency: invoice.currency,
    invoiceNumber: invoice.number,
    publicToken: invoice.public_token,
    payeeEmail: profile?.paypal_email ?? null,
  });

  return NextResponse.json({ orderID: order.id });
}
