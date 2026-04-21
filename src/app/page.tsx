import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="text-xl font-bold text-brand">InvoicePay</div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="#pricing" className="text-slate-600 hover:text-slate-900">
            Pricing
          </Link>
          <Link href="/login" className="btn-secondary">
            Sign in
          </Link>
          <Link href="/login" className="btn-primary">
            Start free
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
          Get paid faster.
          <br />
          <span className="text-brand">Zero chasing.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          Create a professional invoice in 30 seconds, send it with a single
          link, and collect payment through PayPal — all from one page. Built
          for freelancers who are tired of waiting to get paid.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/login" className="btn-primary px-6 py-3 text-base">
            Create your first invoice — free
          </Link>
          <Link href="#pricing" className="btn-secondary px-6 py-3 text-base">
            See pricing
          </Link>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          No credit card required · 3 free invoices every month
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "30-second invoices",
              body: "Add a client, line items, and send. We generate a branded public link you can share by email or text.",
            },
            {
              title: "One-click PayPal pay",
              body: "Your client clicks Pay, logs into PayPal, and the money lands in your account. We mark the invoice paid automatically.",
            },
            {
              title: "Built for freelancers",
              body: "No bloat. Just the invoice fields you actually need, printable PDF, and a dashboard to track what's owed.",
            },
          ].map((f) => (
            <div key={f.title} className="card">
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="text-center text-3xl font-bold">Simple pricing</h2>
        <p className="mt-2 text-center text-slate-600">
          Start free. Upgrade when you send your 4th invoice.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="card">
            <h3 className="text-xl font-semibold">Free</h3>
            <p className="mt-1 text-3xl font-bold">$0</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>3 invoices per month</li>
              <li>PayPal pay button on invoices</li>
              <li>Public shareable invoice link</li>
              <li>Dashboard & status tracking</li>
            </ul>
            <Link href="/login" className="btn-secondary mt-6 w-full">
              Start free
            </Link>
          </div>
          <div className="card border-brand ring-2 ring-brand/30">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Pro</h3>
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                Most popular
              </span>
            </div>
            <p className="mt-1 text-3xl font-bold">
              $9<span className="text-base font-normal text-slate-500">/mo</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>Unlimited invoices</li>
              <li>Printable / PDF-ready layout</li>
              <li>Custom business name & notes</li>
              <li>Priority support</li>
            </ul>
            <Link href="/login" className="btn-primary mt-6 w-full">
              Go Pro
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} InvoicePay
      </footer>
    </main>
  );
}
