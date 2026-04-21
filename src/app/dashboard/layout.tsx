import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, business_name, email")
    .eq("id", user.id)
    .single();

  const isPro = profile?.plan === "pro";

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/dashboard" className="text-lg font-bold text-brand">
            InvoicePay
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-slate-700 hover:text-slate-900">
              Invoices
            </Link>
            <Link
              href="/dashboard/settings"
              className="text-slate-700 hover:text-slate-900"
            >
              Settings
            </Link>
            <Link
              href="/dashboard/billing"
              className="text-slate-700 hover:text-slate-900"
            >
              Billing
            </Link>
            {isPro ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                Pro
              </span>
            ) : (
              <Link href="/dashboard/billing" className="btn-primary text-xs">
                Upgrade
              </Link>
            )}
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
