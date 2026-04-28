import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPlan } from "@/lib/plans";
import DarkModeToggle from "@/components/DarkModeToggle";
import ShortcutsProvider from "@/components/ShortcutsProvider";
import SidebarNav from "./SidebarNav";

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
    .select("plan, full_name, company_name, email")
    .eq("id", user.id)
    .single();

  const plan = getPlan(profile?.plan);
  const displayName =
    profile?.full_name || profile?.company_name || profile?.email || user.email;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <ShortcutsProvider />
      <div className="flex">
        <SidebarNav planId={plan.id} />
        <div className="ml-0 flex-1 md:ml-64">
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <span className="hidden sm:inline">Signed in as </span>
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {displayName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`badge ${
                  plan.id === "free"
                    ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    : plan.id === "starter"
                      ? "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"
                      : plan.id === "pro"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                        : "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                }`}
              >
                {plan.name}
              </span>
              <DarkModeToggle />
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="btn-ghost px-2 py-1.5 text-xs"
                >
                  Sign out
                </button>
              </form>
            </div>
          </header>
          <main className="px-6 py-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}


