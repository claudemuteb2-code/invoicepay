import Link from "next/link";

export const metadata = {
  title: "Status — InvoiceFlow",
  description: "All systems operational. 99.9% uptime SLA.",
};

const SYSTEMS = [
  { name: "App", description: "Web application and dashboard" },
  { name: "API", description: "Public REST API and integrations" },
  { name: "Database", description: "User data and invoice storage" },
  { name: "PayPal payments", description: "Subscription billing & invoice checkouts" },
  { name: "Email delivery", description: "Outbound invoice emails and reminders" },
];

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            InvoiceFlow
          </Link>
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
            ← Back to home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-16 pt-12">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
            <h1 className="text-xl font-semibold text-emerald-900 dark:text-emerald-100">
              All systems operational
            </h1>
          </div>
          <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-200">
            Targeting 99.9% uptime. Last incident: none reported.
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {SYSTEMS.map((s, i) => (
            <div
              key={s.name}
              className={`flex items-center justify-between gap-4 px-5 py-4 ${
                i > 0 ? "border-t border-slate-100 dark:border-slate-800" : ""
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {s.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {s.description}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                Operational
              </span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          This page is updated manually. Real-time monitoring is on the roadmap.
        </p>
      </section>
    </main>
  );
}
