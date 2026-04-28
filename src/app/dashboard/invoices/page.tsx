import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/currencies";
import type { Invoice } from "@/types/db";

export const dynamic = "force-dynamic";

export default async function InvoicesListPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const list = (invoices || []) as Invoice[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Invoices
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            All invoices you&apos;ve created.
          </p>
        </div>
        <Link href="/dashboard/invoices/new" className="btn-primary">
          + New invoice
        </Link>
      </div>

      <div className="card p-0">
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
                <th className="p-4">Issued</th>
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
                    {new Date(inv.issue_date || inv.created_at).toLocaleDateString()}
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
