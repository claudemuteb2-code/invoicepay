import Link from "next/link";
import { getLimits, getPlan, type PlanId } from "@/lib/plans";

type Props = {
  plan: PlanId;
  invoicesThisMonth: number;
  activeClients: number;
};

/**
 * Friendly progress / limits banner for Free and Starter users. Shows how
 * close they are to their plan caps and a CTA to upgrade.
 */
export default function UpgradeBanner({
  plan,
  invoicesThisMonth,
  activeClients,
}: Props) {
  if (plan !== "free" && plan !== "starter") return null;

  const limits = getLimits(plan);
  const meta = getPlan(plan);
  const invoicesCap = limits.maxInvoicesPerMonth;
  const clientsCap = limits.maxActiveClients;

  const invoicesPct =
    invoicesCap == null ? 0 : Math.min(100, (invoicesThisMonth / invoicesCap) * 100);
  const clientsPct =
    clientsCap == null ? 0 : Math.min(100, (activeClients / clientsCap) * 100);

  const nearLimit = invoicesPct >= 80 || clientsPct >= 80;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4 text-sm ${
        nearLimit
          ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100"
          : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
      }`}
    >
      <div className="space-y-1">
        <p className="font-semibold">
          You&apos;re on the <span className="capitalize">{meta.name}</span> plan
          {nearLimit ? " — close to your monthly limit." : "."}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {invoicesCap != null && (
            <span>
              <strong>{invoicesThisMonth}</strong> / {invoicesCap} invoices this month
            </span>
          )}
          {clientsCap != null && (
            <span>
              <strong>{activeClients}</strong> / {clientsCap} active clients
            </span>
          )}
        </div>
      </div>
      <Link href="/dashboard/billing" className="btn-primary px-3 py-1.5 text-xs">
        Upgrade
      </Link>
    </div>
  );
}
