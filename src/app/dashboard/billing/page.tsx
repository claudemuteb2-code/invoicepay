import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PLANS, PLAN_ORDER, getPlan, type PlanId } from "@/lib/plans";
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
    .select(
      "plan, paypal_subscription_id, paypal_plan_id, subscription_status, subscription_current_period_end",
    )
    .eq("id", user.id)
    .single();

  const planId = (profile?.plan ?? "free") as PlanId;
  const currentPlan = getPlan(planId);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
  // Map plan tiers to PayPal plan ids. Phase 12 will create three plans;
  // until then, the legacy `PAYPAL_PLAN_ID` is reused for the Pro tier.
  const planIdMap: Partial<Record<PlanId, string>> = {
    starter: process.env.PAYPAL_STARTER_PLAN_ID || "",
    pro: process.env.PAYPAL_PRO_PLAN_ID || process.env.PAYPAL_PLAN_ID || "",
    business: process.env.PAYPAL_BUSINESS_PLAN_ID || "",
  };

  const isPaid = planId !== "free";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Billing
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage your plan, view billing history, and cancel anytime.
        </p>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Current plan
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {currentPlan.name}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {currentPlan.description}
            </p>
          </div>
          {isPaid && (
            <div className="text-right text-sm">
              <p className="text-slate-700 dark:text-slate-200">
                Status:{" "}
                <span className="font-semibold">
                  {profile?.subscription_status || "ACTIVE"}
                </span>
              </p>
              {profile?.subscription_current_period_end && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Next billing:{" "}
                  {new Date(
                    profile.subscription_current_period_end,
                  ).toLocaleDateString()}
                </p>
              )}
              {profile?.paypal_subscription_id && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  PayPal sub:{" "}
                  <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                    {profile.paypal_subscription_id}
                  </code>
                </p>
              )}
            </div>
          )}
        </div>
        {isPaid && (
          <p className="mt-4 rounded-md bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
            To cancel, open your PayPal account → Settings → Payments →
            Automatic payments and cancel &quot;InvoiceFlow {currentPlan.name}
            &quot;.
          </p>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Choose a plan
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          You can change or cancel at any time.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          const isCurrent = id === planId;
          const paypalPlanId = id === "free" ? "" : planIdMap[id] || "";
          return (
            <div
              key={id}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                plan.recommended
                  ? "border-brand bg-white shadow-md ring-2 ring-brand/30 dark:bg-slate-900"
                  : "border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              {plan.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {plan.name}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {plan.description}
              </p>
              <p className="mt-4 text-3xl font-black text-slate-900 dark:text-slate-100">
                ${plan.priceMonthly}
                <span className="text-base font-normal text-slate-500 dark:text-slate-400">
                  {plan.priceMonthly > 0 ? "/mo" : ""}
                </span>
              </p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {plan.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                      aria-hidden
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {isCurrent ? (
                  <button
                    type="button"
                    disabled
                    className="btn-secondary w-full cursor-default opacity-70"
                  >
                    Current plan
                  </button>
                ) : id === "free" ? (
                  <Link href="/dashboard" className="btn-secondary w-full">
                    Manage plan in PayPal
                  </Link>
                ) : paypalPlanId && clientId ? (
                  <SubscribeButton
                    clientId={clientId}
                    planId={paypalPlanId}
                    planTier={id}
                  />
                ) : (
                  <div className="rounded-md bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                    Admin: set <code>PAYPAL_{id.toUpperCase()}_PLAN_ID</code>{" "}
                    in your environment to enable this tier. See README.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
