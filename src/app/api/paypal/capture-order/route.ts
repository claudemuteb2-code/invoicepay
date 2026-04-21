import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { captureInvoiceOrder } from "@/lib/paypal";

/**
 * Public endpoint called from the shareable invoice page after the
 * client approves the PayPal order. We capture the payment and mark
 * the invoice paid. The webhook handler provides redundant updates.
 */
export async function POST(req: NextRequest) {
  const { orderID, token } = (await req.json()) as {
    orderID?: string;
    token?: string;
  };
  if (!orderID || !token) {
    return NextResponse.json(
      { error: "Missing orderID or token" },
      { status: 400 },
    );
  }

  const capture = await captureInvoiceOrder(orderID);

  if (capture.status !== "COMPLETED") {
    return NextResponse.json(
      { error: `PayPal status: ${capture.status}` },
      { status: 402 },
    );
  }

  const refToken =
    capture.purchase_units?.[0]?.reference_id ?? token;
  const captureId =
    capture.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("invoices")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      paypal_capture_id: captureId,
      updated_at: new Date().toISOString(),
    })
    .eq("public_token", refToken);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
