import Link from "next/link";
import { PLANS, PLAN_ORDER, type PlanId } from "@/lib/plans";

export const metadata = {
  title: "Pricing — InvoiceFlow",
  description:
    "Free forever. Upgrade for unlimited invoices, automatic reminders, and team access.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark />
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              InvoiceFlow
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/login" className="btn-secondary">
              Sign in
            </Link>
            <Link href="/login" className="btn-primary">
              Start free
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-10 pt-16 text-center">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-5xl">
          Simple, honest pricing
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Start free. Upgrade as you grow. Cancel anytime — no contracts, no
          surprises.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-6 lg:grid-cols-4">
          {PLAN_ORDER.map((id) => (
            <PlanCard key={id} planId={id} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
          All paid plans billed monthly via PayPal. No credit card required for
          Free.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24">
        <h2 className="text-center text-2xl font-bold text-slate-900 dark:text-slate-100">
          Frequently asked
        </h2>
        <div className="mt-8 space-y-4">
          {[
            {
              q: "Can I change plans later?",
              a: "Yes — upgrade or downgrade at any time. Upgrades take effect immediately. Downgrades take effect at the end of your current billing period.",
            },
            {
              q: "What payment methods are supported?",
              a: "All paid plans are billed monthly via PayPal. Your client can pay invoices with PayPal balance, credit card, or debit card — no PayPal account required for them.",
            },
            {
              q: "Do you offer annual billing?",
              a: "Not yet — monthly only for now. We'll add annual plans soon.",
            },
            {
              q: "Is there a free trial of paid plans?",
              a: "The Free plan is a forever-free trial. Upgrade only when you need more clients, more invoices, or advanced features.",
            },
          ].map((f) => (
            <details
              key={f.q}
              className="group rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {f.q}
                <span className="text-slate-400 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 text-sm text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} InvoiceFlow. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-slate-700 dark:hover:text-slate-200">
              Home
            </Link>
            <Link
              href="/status"
              className="hover:text-slate-700 dark:hover:text-slate-200"
            >
              Status
            </Link>
            <Link
              href="/login"
              className="hover:text-slate-700 dark:hover:text-slate-200"
            >
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function PlanCard({ planId }: { planId: PlanId }) {
  const plan = PLANS[planId];
  const recommended = plan.recommended;
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 shadow-sm ${
        recommended
          ? "border-brand bg-white ring-2 ring-brand/30 dark:bg-slate-900"
          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      {recommended && (
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
      <p className="mt-5 text-4xl font-black text-slate-900 dark:text-slate-100">
        ${plan.priceMonthly}
        <span className="text-base font-normal text-slate-500 dark:text-slate-400">
          {plan.priceMonthly > 0 ? "/mo" : ""}
        </span>
      </p>
      <ul className="mt-6 flex-1 space-y-2 text-sm text-slate-600 dark:text-slate-300">
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
      <Link
        href={planId === "free" ? "/login" : "/dashboard/billing"}
        className={`mt-6 ${
          recommended ? "btn-primary" : "btn-secondary"
        } w-full`}
      >
        {plan.ctaLabel}
      </Link>
    </div>
  );
}

function LogoMark() {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 text-white">
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M3 4h18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm3 4v2h12V8H6zm0 4v2h8v-2H6zm0 4v2h6v-2H6z" />
      </svg>
    </span>
  );
}
