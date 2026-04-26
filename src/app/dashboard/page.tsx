import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/currencies";
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
    .order("created_at", { ascending: false });

  const list = (invoices || []) as Invoice[];

  // Count invoices created this calendar month (for free-tier indicator)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = list.filter((i) => new Date(i.created_at) >= monthStart)
    .length;

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user!.id)
    .single();

  const isPro = profile?.plan === "pro";
  const outstanding = list
    .filter((i) => i.status !== "paid")
    .reduce((s, i) => s + Number(i.total), 0);
  const paid = list
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + Number(i.total), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Invoices
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {isPro ? (
              <>You&apos;re on the Pro plan — unlimited invoices.</>
            ) : (
              <>
                Free plan: <strong>{thisMonth}/3</strong> invoices used this
                month.{" "}
                <Link
                  href="/dashboard/billing"
                  className="font-semibold text-brand"
                >
                  Upgrade for unlimited →
                </Link>
              </>
            )}
          </p>
        </div>
        <Link href="/dashboard/invoices/new" className="btn-primary">
          + New invoice
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Outstanding"
          value={formatMoney(outstanding)}
          tone="amber"
        />
        <StatCard label="Paid" value={formatMoney(paid)} tone="emerald" />
        <StatCard
          label="Total invoices"
          value={String(list.length)}
          tone="slate"
        />
      </div>

      <div className="card p-0">
        {list.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-600">No invoices yet.</p>
            <Link
              href="/dashboard/invoices/new"
              className="btn-primary mt-4 inline-flex"
            >
              Create your first invoice
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
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
                <tr key={inv.id} className="border-b border-slate-100">
                  <td className="p-4 font-mono text-xs">{inv.number}</td>
                  <td className="p-4">{inv.client_name}</td>
                  <td className="p-4">
                    {formatMoney(Number(inv.total), inv.currency)}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="p-4 text-slate-500">
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
  tone: "amber" | "emerald" | "slate";
}) {
  const tones: Record<string, string> = {
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
    slate: "bg-slate-400",
  };
  return (
    <div className="card relative overflow-hidden">
      <div
        className={`absolute left-0 top-0 h-full w-1 ${tones[tone]}`}
        aria-hidden
      />
      <div className="pl-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </div>
        <div className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
          {value}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    sent: "bg-blue-100 text-blue-700",
    paid: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
        map[status] || map.draft
      }`}
    >
      {status}
    </span>
  );
}
