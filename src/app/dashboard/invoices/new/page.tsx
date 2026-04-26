import Link from "next/link";
import { redirect } from "next/navigation";
import InvoiceForm from "@/components/InvoiceForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const { count } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", monthStart);

  const used = count ?? 0;
  const isPro = profile?.plan === "pro";
  const overLimit = !isPro && used >= 3;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Back to invoices
        </Link>
        <h1 className="mt-2 text-2xl font-bold">New invoice</h1>
      </div>

      {overLimit ? (
        <div className="card border-amber-200 bg-amber-50">
          <h2 className="text-lg font-semibold text-amber-900">
            You've used all 3 free invoices this month
          </h2>
          <p className="mt-1 text-sm text-amber-800">
            Upgrade to Pro for unlimited invoices, PDF-ready layouts, and
            custom branding — just $9/month.
          </p>
          <Link href="/dashboard/billing" className="btn-primary mt-4 inline-flex">
            Upgrade to Pro
          </Link>
        </div>
      ) : (
        <InvoiceForm isPro={isPro} />
      )}
    </div>
  );
}
