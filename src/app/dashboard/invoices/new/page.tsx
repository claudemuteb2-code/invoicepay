import Link from "next/link";
import { redirect } from "next/navigation";
import InvoiceForm from "@/components/InvoiceForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLimits, type PlanId } from "@/lib/plans";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const planId = (profile?.plan ?? "free") as PlanId;
  const limits = getLimits(planId);

  let used = 0;
  if (limits.maxInvoicesPerMonth != null) {
    const now = new Date();
    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toISOString();
    const { count } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", monthStart);
    used = count ?? 0;
  }

  const overLimit =
    limits.maxInvoicesPerMonth != null && used >= limits.maxInvoicesPerMonth;

  // For backwards compatibility with InvoiceForm (which only knows isPro).
  const isPro = limits.templateCount >= 3;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/invoices"
          className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          ← Back to invoices
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
          New invoice
        </h1>
      </div>

      {overLimit ? (
        <div className="card border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10">
          <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
            You&apos;ve hit your plan limit
          </h2>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
            Your current plan allows {limits.maxInvoicesPerMonth} invoices per
            calendar month. Upgrade for higher limits and more features.
          </p>
          <Link
            href="/dashboard/billing"
            className="btn-primary mt-4 inline-flex"
          >
            See plans
          </Link>
        </div>
      ) : (
        <InvoiceForm isPro={isPro} />
      )}
    </div>
  );
}
