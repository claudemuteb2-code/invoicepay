import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/currencies";
import { getPlan, type PlanId } from "@/lib/plans";
import UpgradeBanner from "@/components/UpgradeBanner";
import type { Invoice } from "@/types/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const list = (invoices || []) as Invoice[];

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const { count: thisMonthCount } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)
    .gte("created_at", monthStart.toISOString());

  const { count: activeClientsCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)
    .eq("archived", false);

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, full_name, company_name")
    .eq("id", user!.id)
    .single();

  const planId = (profile?.plan ?? "free") as PlanId;
  const plan = getPlan(planId);

  // Aggregate totals across all invoices (full set, not just last 10).
  const { data: allInvoices } = await supabase
    .from("invoices")
    .select("status, total, due_date")
    .eq("user_id", user!.id);

  const all = (allInvoices || []) as Pick<
    Invoice,
    "status" | "total" | "due_date"
  >[];

  const today = new Date().toISOString().slice(0, 10);
  const outstanding = all
    .filter((i) => i.status !== "paid" && i.status !== "cancelled")
    .reduce((s, i) => s + Number(i.total), 0);
  const paid = all
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + Number(i.total), 0);
  const overdueCount = all.filter(
    (i) =>
      i.status !== "paid" &&
      i.status !== "cancelled" &&
      i.due_date &&
      i.due_date < today,
  ).length;
  const paidCount = all.filter((i) => i.status === "paid").length;

  const greetingName = profile?.full_name || profile?.company_name || "there";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome back, {greetingName}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            You&apos;re on the <span className="font-medium">{plan.name}</span>{" "}
            plan.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/clients/new" className="btn-secondary">
            + New client
          </Link>
          <Link href="/dashboard/invoices/new" className="btn-primary">
            + New invoice
          </Link>
        </div>
      </div>

      <UpgradeBanner
        plan={planId}
        invoicesThisMonth={thisMonthCount ?? 0}
        activeClients={activeClientsCount ?? 0}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Outstanding"
          value={formatMoney(outstanding)}
          tone="amber"
        />
        <StatCard label="Paid" value={formatMoney(paid)} tone="emerald" />
        <StatCard
          label="Overdue"
          value={String(overdueCount)}
          tone="rose"
        />
        <StatCard
          label="Paid invoices"
          value={String(paidCount)}
          tone="slate"
        />
      </div>

      <div className="card p-0">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Recent invoices
          </h2>
          <Link
            href="/dashboard/invoices"
            className="text-sm font-medium text-brand hover:underline"
          >
            View all →
          </Link>
        </div>
        {list.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              No invoices yet.
            </p>
            <Link
              href="/dashboard/invoices/new"
              className="btn-primary mt-4 inline-flex"
            >
              Create your first invoice
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="p-4">Number</th>
                <th className="p-4">Client</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-slate-100 dark:border-slate-800/60"
                >
                  <td className="p-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                    {inv.number}
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-200">
                    {inv.client_name}
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-200">
                    {formatMoney(Number(inv.total), inv.currency)}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">
                    {new Date(inv.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/dashboard/invoices/${inv.id}`}
                      className="text-brand hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "amber" | "emerald" | "rose" | "slate";
}) {
  const tones: Record<string, string> = {
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
    slate: "bg-slate-400",
  };
  return (
    <div className="card relative overflow-hidden">
      <div
        className={`absolute left-0 top-0 h-full w-1 ${tones[tone]}`}
        aria-hidden
      />
      <div className="pl-2">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    sent: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    viewed: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
    paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
    overdue: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    cancelled:
      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
        map[status] || map.draft
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
