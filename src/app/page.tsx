import Link from "next/link";
import { PLAN_ORDER, PLANS } from "@/lib/plans";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark />
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              InvoiceFlow
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <Link href="#features" className="hover:text-slate-900">
              Features
            </Link>
            <Link href="#templates" className="hover:text-slate-900">
              Templates
            </Link>
            <Link href="#pricing" className="hover:text-slate-900">
              Pricing
            </Link>
            <Link href="#faq" className="hover:text-slate-900">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-secondary">
              Sign in
            </Link>
            <Link href="/login" className="btn-primary">
              Start free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-40"
          style={{
            background:
              "radial-gradient(60% 40% at 50% 10%, rgba(99,102,241,0.25) 0%, rgba(255,255,255,0) 70%)",
          }}
        />
        <div className="mx-auto max-w-4xl px-6 pb-16 pt-20 text-center md:pt-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            For freelancers, agencies & small businesses
          </span>
          <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-900 md:text-6xl">
            Get paid faster.
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
              Zero chasing.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            Create a beautiful invoice in 30 seconds, send it with a single link,
            and collect payment through PayPal — all from one page. Built for
            freelancers who are tired of waiting to get paid.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/login" className="btn-primary px-6 py-3 text-base">
              Create your first invoice — free
            </Link>
            <Link href="#pricing" className="btn-secondary px-6 py-3 text-base">
              See pricing
            </Link>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            No credit card required · 5 free invoices every month
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: <IconBolt />,
              title: "30-second invoices",
              body: "Add a client, line items, pick a currency, and send. We generate a branded public link you can share by email or text.",
            },
            {
              icon: <IconPaypal />,
              title: "One-click PayPal pay",
              body: "Your client clicks Pay, logs into PayPal (or pays as guest), and the money lands in your account. We mark it paid automatically.",
            },
            {
              icon: <IconGlobe />,
              title: "15 currencies, one click",
              body: "USD, EUR, GBP, INR, NGN, BRL, KES and more — with proper locale formatting. Invoice clients anywhere.",
            },
            {
              icon: <IconLayout />,
              title: "Beautiful templates",
              body: "Three professionally designed templates. Classic is free for everyone; Modern and Minimal are included in Pro.",
            },
            {
              icon: <IconDownload />,
              title: "One-click PDF download",
              body: "Every invoice — yours or your client's — can be downloaded as a polished PDF. No extra software needed.",
            },
            {
              icon: <IconLock />,
              title: "Your data, your rules",
              body: "Built on Supabase with row-level security. Only you can see your invoices. Cancel and export anytime.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="card transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                {f.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Templates preview */}
      <section id="templates" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Pick a template that fits your brand
            </h2>
            <p className="mt-3 text-slate-600">
              Switch between Classic, Modern, and Minimal in one click.
              Every template is print-ready and looks great on mobile.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <TemplateCard
              name="Classic"
              tag="Free"
              tagTone="slate"
              swatch={
                <div className="h-full w-full rounded bg-white ring-1 ring-slate-200">
                  <div className="h-2 w-full rounded-t bg-indigo-600" />
                  <div className="space-y-2 p-4">
                    <div className="h-2 w-24 rounded bg-slate-300" />
                    <div className="h-2 w-16 rounded bg-slate-200" />
                    <div className="mt-6 space-y-1">
                      <div className="h-1.5 w-full rounded bg-slate-200" />
                      <div className="h-1.5 w-full rounded bg-slate-200" />
                      <div className="h-1.5 w-5/6 rounded bg-slate-200" />
                    </div>
                  </div>
                </div>
              }
              desc="Clean, professional, works everywhere."
            />
            <TemplateCard
              name="Modern"
              tag="Pro"
              tagTone="brand"
              swatch={
                <div className="h-full w-full rounded bg-white ring-1 ring-slate-200">
                  <div
                    className="h-12 w-full rounded-t p-3"
                    style={{
                      background:
                        "linear-gradient(135deg, #0ea5e9 0%, #6366f1 55%, #a855f7 100%)",
                    }}
                  >
                    <div className="flex justify-between">
                      <div className="space-y-1">
                        <div className="h-1.5 w-12 rounded bg-white/80" />
                        <div className="h-2 w-16 rounded bg-white" />
                      </div>
                      <div className="h-5 w-16 rounded bg-white/20" />
                    </div>
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="h-1.5 w-20 rounded bg-slate-200" />
                    <div className="h-1.5 w-24 rounded bg-slate-200" />
                    <div className="mt-4 space-y-1">
                      <div className="h-1.5 w-full rounded bg-slate-200" />
                      <div className="h-1.5 w-full rounded bg-slate-200" />
                    </div>
                  </div>
                </div>
              }
              desc="Gradient header, bold totals. For creatives."
            />
            <TemplateCard
              name="Minimal"
              tag="Pro"
              tagTone="brand"
              swatch={
                <div className="h-full w-full rounded bg-white p-4 ring-1 ring-slate-200">
                  <div className="flex items-end justify-between border-b-2 border-slate-900 pb-3">
                    <div className="space-y-1">
                      <div className="h-3 w-16 rounded bg-slate-900" />
                      <div className="h-1 w-10 rounded bg-slate-300" />
                    </div>
                    <div className="h-1.5 w-14 rounded bg-slate-400" />
                  </div>
                  <div className="mt-4 space-y-1">
                    <div className="h-1.5 w-full rounded bg-slate-200" />
                    <div className="h-1.5 w-full rounded bg-slate-200" />
                    <div className="h-1.5 w-4/6 rounded bg-slate-200" />
                  </div>
                </div>
              }
              desc="Monochrome, typography-forward. Editorial."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Pick a plan that fits
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Free forever. Upgrade as you grow. Cancel anytime — no contracts.
          </p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-4">
          {PLAN_ORDER.map((id) => {
            const plan = PLANS[id];
            return (
              <div
                key={id}
                className={`relative flex flex-col rounded-2xl border p-6 shadow-sm ${
                  plan.recommended
                    ? "border-brand bg-white ring-2 ring-brand/30 dark:bg-slate-900"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                {plan.recommended && (
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
                <p className="mt-4 text-4xl font-black text-slate-900 dark:text-slate-100">
                  ${plan.priceMonthly}
                  <span className="text-base font-normal text-slate-500 dark:text-slate-400">
                    {plan.priceMonthly > 0 ? "/mo" : ""}
                  </span>
                </p>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {plan.highlights.map((h) => (
                    <Feature key={h}>{h}</Feature>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`mt-6 ${plan.recommended ? "btn-primary" : "btn-secondary"} w-full`}
                >
                  {plan.ctaLabel}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
            Frequently asked questions
          </h2>
          <div className="mt-10 space-y-4">
            {[
              {
                q: "How do I get paid?",
                a: "We connect your invoices to PayPal Checkout. Your client pays with PayPal or a credit/debit card; the money lands in your PayPal account and your invoice is marked paid automatically.",
              },
              {
                q: "What happens when I hit the free limit?",
                a: "You can view and edit your existing invoices. To send more than 5 in a calendar month, upgrade to Starter ($12/mo) or Pro ($29/mo) for higher caps.",
              },
              {
                q: "Which currencies are supported?",
                a: "USD, EUR, GBP, CAD, AUD, JPY, CHF, SGD, AED, INR, MXN, BRL, NGN, ZAR, KES — with proper locale formatting on both the public page and the PDF.",
              },
              {
                q: "Can I cancel any time?",
                a: "Yes. Cancel your subscription from the Billing page. You keep paid features until the end of your current billing period.",
              },
            ].map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition open:shadow-md"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-900">
                  {f.q}
                  <span className="text-slate-400 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Stop chasing invoices. Start getting paid.
        </h2>
        <p className="mt-3 text-slate-600">
          Your first invoice takes 30 seconds. Your first payment could land
          today.
        </p>
        <Link
          href="/login"
          className="btn-primary mt-8 inline-flex px-8 py-3 text-base"
        >
          Start free — no credit card
        </Link>
      </section>

      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <LogoMark />
            <span>© {new Date().getFullYear()} InvoiceFlow</span>
          </div>
          <div className="flex gap-4">
            <Link href="/pricing" className="hover:text-slate-800 dark:hover:text-slate-200">
              Pricing
            </Link>
            <Link href="/status" className="hover:text-slate-800 dark:hover:text-slate-200">
              Status
            </Link>
            <Link href="/login" className="hover:text-slate-800 dark:hover:text-slate-200">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <svg
        className="mt-0.5 h-4 w-4 flex-none text-emerald-500"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z"
          clipRule="evenodd"
        />
      </svg>
      <span>{children}</span>
    </li>
  );
}

function TemplateCard({
  name,
  tag,
  tagTone,
  swatch,
  desc,
}: {
  name: string;
  tag: string;
  tagTone: "slate" | "brand";
  swatch: React.ReactNode;
  desc: string;
}) {
  return (
    <div className="card">
      <div className="aspect-[4/5] overflow-hidden rounded-md bg-white">
        {swatch}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">{name}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            tagTone === "brand"
              ? "bg-brand/10 text-brand"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {tag}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-600">{desc}</p>
    </div>
  );
}

function LogoMark() {
  return (
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
  );
}

function IconBolt() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h7v8l10-12h-7V2z" />
    </svg>
  );
}
function IconPaypal() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}
function IconLayout() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  );
}
function IconDownload() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
