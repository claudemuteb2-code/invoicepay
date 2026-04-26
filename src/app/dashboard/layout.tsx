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
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-bold text-slate-900"
          >
            <span
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-white"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #0ea5e9 100%)",
              }}
              aria-hidden
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </span>
            InvoicePay
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link
              href="/dashboard"
              className="font-medium text-slate-700 hover:text-slate-900"
            >
              Invoices
            </Link>
            <Link
              href="/dashboard/settings"
              className="font-medium text-slate-700 hover:text-slate-900"
            >
              Settings
            </Link>
            <Link
              href="/dashboard/billing"
              className="font-medium text-slate-700 hover:text-slate-900"
            >
              Billing
            </Link>
            {isPro ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Pro
              </span>
            ) : (
              <Link
                href="/dashboard/billing"
                className="btn-primary px-3 py-1.5 text-xs"
              >
                Upgrade to Pro
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
