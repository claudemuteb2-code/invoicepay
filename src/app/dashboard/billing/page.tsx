import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SubscribeButton from "./SubscribeButton";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, paypal_subscription_id, subscription_status")
    .eq("id", user.id)
    .single();

  const isPro = profile?.plan === "pro";
  const planId = process.env.PAYPAL_PLAN_ID || "";
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Billing</h1>

      {isPro ? (
        <div className="card">
          <h2 className="text-lg font-semibold">You're on Pro</h2>
          <p className="mt-1 text-sm text-slate-600">
            Status:{" "}
            <span className="font-semibold">
              {profile?.subscription_status || "ACTIVE"}
            </span>
          </p>
          {profile?.paypal_subscription_id && (
            <p className="mt-1 text-xs text-slate-500">
              PayPal subscription id:{" "}
              <code>{profile.paypal_subscription_id}</code>
            </p>
          )}
          <p className="mt-4 text-sm text-slate-600">
            To cancel, open your PayPal account → Settings → Payments →
            Automatic payments and cancel "InvoicePay Pro".
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Upgrade to Pro — $9/mo</h2>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li>· Unlimited invoices</li>
                <li>· PDF-ready printable layout</li>
                <li>· Custom business branding on invoices</li>
                <li>· Priority support</li>
              </ul>
              <p className="mt-3 text-xs text-slate-500">
                Billed monthly via PayPal. Cancel anytime from your PayPal
                account.
              </p>
            </div>
            <SubscribeButton clientId={clientId} planId={planId} />
          </div>
          {!planId && (
            <p className="mt-4 rounded bg-amber-50 p-3 text-xs text-amber-800">
              Admin: set <code>PAYPAL_PLAN_ID</code> in your environment to
              enable subscriptions. See README.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
