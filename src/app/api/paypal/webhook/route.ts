import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyPayPalWebhook } from "@/lib/paypal";

export const dynamic = "force-dynamic";

/**
 * Handles the PayPal webhook events we care about:
 *   - BILLING.SUBSCRIPTION.ACTIVATED
 *   - BILLING.SUBSCRIPTION.CANCELLED
 *   - BILLING.SUBSCRIPTION.SUSPENDED
 *   - PAYMENT.SALE.COMPLETED  (recurring subscription payments)
 *   - CHECKOUT.ORDER.APPROVED / PAYMENT.CAPTURE.COMPLETED (invoice payments)
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const verified = await verifyPayPalWebhook({
    headers: req.headers,
    rawBody,
  });

  // In sandbox without a webhook id configured we still process events,
  // but log the warning. In production you should reject unverified events.
  if (!verified && process.env.PAYPAL_WEBHOOK_ID) {
    console.warn("PayPal webhook signature failed verification");
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as {
    id: string;
    event_type: string;
    resource: Record<string, any>;
  };

  const admin = createSupabaseAdminClient();

  // Idempotency: bail if we've already processed this event id.
  const { error: logErr } = await admin
    .from("webhook_events")
    .insert({
      id: event.id,
      event_type: event.event_type,
      payload: event,
    });
  if (logErr && !String(logErr.message).toLowerCase().includes("duplicate")) {
    console.error("webhook log insert failed", logErr);
  } else if (logErr) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  try {
    switch (event.event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
      case "BILLING.SUBSCRIPTION.UPDATED": {
        const subId = event.resource.id as string;
        await admin
          .from("profiles")
          .update({
            plan: "pro",
            subscription_status: "ACTIVE",
            paypal_subscription_id: subId,
            subscription_current_period_end:
              event.resource.billing_info?.next_billing_time ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("paypal_subscription_id", subId);
        break;
      }
      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.EXPIRED":
      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        const subId = event.resource.id as string;
        await admin
          .from("profiles")
          .update({
            plan: "free",
            subscription_status: event.event_type
              .replace("BILLING.SUBSCRIPTION.", ""),
            updated_at: new Date().toISOString(),
          })
          .eq("paypal_subscription_id", subId);
        break;
      }
      case "PAYMENT.SALE.COMPLETED": {
        // Recurring subscription payment: extend the current period.
        const subId = event.resource.billing_agreement_id as
          | string
          | undefined;
        if (subId) {
          await admin
            .from("profiles")
            .update({
              plan: "pro",
              subscription_status: "ACTIVE",
              updated_at: new Date().toISOString(),
            })
            .eq("paypal_subscription_id", subId);
        }
        break;
      }
      case "PAYMENT.CAPTURE.COMPLETED":
      case "CHECKOUT.ORDER.APPROVED": {
        // One-off invoice payment. reference_id holds our public_token.
        const refToken =
          event.resource.purchase_units?.[0]?.reference_id ??
          event.resource.supplementary_data?.related_ids?.order_id;
        const captureId = event.resource.id as string | undefined;
        if (refToken) {
          await admin
            .from("invoices")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              paypal_capture_id: captureId ?? null,
              updated_at: new Date().toISOString(),
            })
            .eq("public_token", refToken);
        }
        break;
      }
      default:
        // Accept but ignore other events.
        break;
    }
  } catch (err) {
    console.error("webhook handler error", err);
    return NextResponse.json({ error: "handler error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
