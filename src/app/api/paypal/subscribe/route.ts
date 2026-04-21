import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { paypalFetch } from "@/lib/paypal";

/**
 * Called after the client-side PayPal button completes. We fetch the
 * subscription status from PayPal and flip the user's plan to 'pro'
 * if it's ACTIVE or APPROVED. The webhook will keep this in sync
 * over the subscription lifetime.
 */
export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subscriptionID } = (await req.json()) as { subscriptionID?: string };
  if (!subscriptionID) {
    return NextResponse.json({ error: "Missing subscriptionID" }, { status: 400 });
  }

  const res = await paypalFetch(`/v1/billing/subscriptions/${subscriptionID}`);
  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: `PayPal lookup failed: ${text}` },
      { status: 502 },
    );
  }
  const sub = (await res.json()) as {
    id: string;
    status: string;
    billing_info?: { next_billing_time?: string };
  };

  const isActive = ["ACTIVE", "APPROVED", "APPROVAL_PENDING"].includes(
    sub.status,
  );

  const { error } = await supabase
    .from("profiles")
    .update({
      plan: isActive ? "pro" : "free",
      paypal_subscription_id: sub.id,
      subscription_status: sub.status,
      subscription_current_period_end:
        sub.billing_info?.next_billing_time ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, status: sub.status });
}
