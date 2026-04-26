import { formatMoney } from "@/lib/currencies";
import { getTemplate, type TemplateId } from "@/lib/templates";
import type { Invoice } from "@/types/db";

type Props = {
  invoice: Invoice;
  businessName: string;
  templateId?: TemplateId;
};

export default function InvoiceRender({
  invoice: inv,
  businessName,
  templateId,
}: Props) {
  const t = getTemplate(templateId ?? inv.template);
  switch (t.id) {
    case "modern":
      return <ModernTemplate invoice={inv} businessName={businessName} />;
    case "minimal":
      return <MinimalTemplate invoice={inv} businessName={businessName} />;
    default:
      return <ClassicTemplate invoice={inv} businessName={businessName} />;
  }
}

function LineItems({ inv }: { inv: Invoice }) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
        <tr>
          <th className="py-2 font-medium">Description</th>
          <th className="py-2 text-right font-medium">Qty</th>
          <th className="py-2 text-right font-medium">Rate</th>
          <th className="py-2 text-right font-medium">Amount</th>
        </tr>
      </thead>
      <tbody>
        {inv.items.map((it, idx) => (
          <tr key={idx} className="border-b border-slate-100">
            <td className="py-3">{it.description}</td>
            <td className="py-3 text-right tabular-nums">{it.quantity}</td>
            <td className="py-3 text-right tabular-nums">
              {formatMoney(Number(it.rate), inv.currency)}
            </td>
            <td className="py-3 text-right font-medium tabular-nums">
              {formatMoney(
                Number(it.quantity) * Number(it.rate),
                inv.currency,
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Totals({ inv, accent }: { inv: Invoice; accent?: string }) {
  return (
    <div className="ml-auto w-full max-w-xs space-y-2 text-sm">
      <div className="flex justify-between text-slate-600">
        <span>Subtotal</span>
        <span className="tabular-nums">
          {formatMoney(Number(inv.subtotal), inv.currency)}
        </span>
      </div>
      <div className="flex justify-between text-slate-600">
        <span>Tax ({inv.tax_rate}%)</span>
        <span className="tabular-nums">
          {formatMoney(Number(inv.tax_amount), inv.currency)}
        </span>
      </div>
      <div
        className="flex items-center justify-between border-t border-slate-200 pt-3 text-lg font-bold"
        style={accent ? { color: accent } : undefined}
      >
        <span>Total</span>
        <span className="tabular-nums">
          {formatMoney(Number(inv.total), inv.currency)}
        </span>
      </div>
    </div>
  );
}

function ClassicTemplate({
  invoice: inv,
  businessName,
}: {
  invoice: Invoice;
  businessName: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="h-2 bg-brand" />
      <div className="p-8 md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Invoice
            </p>
            <h1 className="mt-1 font-mono text-2xl font-bold tracking-tight text-slate-900">
              {inv.number}
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-700">
              {businessName}
            </p>
          </div>
          <div className="text-right text-sm text-slate-600">
            <div>
              Issued{" "}
              <span className="font-medium text-slate-900">
                {new Date(inv.created_at).toLocaleDateString()}
              </span>
            </div>
            {inv.due_date && (
              <div>
                Due{" "}
                <span className="font-medium text-slate-900">
                  {new Date(inv.due_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-6 border-t border-slate-100 pt-6 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Billed to
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              {inv.client_name}
            </p>
            {inv.client_email && (
              <p className="text-sm text-slate-600">{inv.client_email}</p>
            )}
          </div>
          <div className="md:text-right">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Amount due
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
              {formatMoney(Number(inv.total), inv.currency)}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <LineItems inv={inv} />
        </div>

        <div className="mt-6">
          <Totals inv={inv} />
        </div>

        {inv.notes && (
          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Notes
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
              {inv.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ModernTemplate({
  invoice: inv,
  businessName,
}: {
  invoice: Invoice;
  businessName: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div
        className="p-8 text-white md:p-10"
        style={{
          background:
            "linear-gradient(135deg, #0ea5e9 0%, #6366f1 55%, #a855f7 100%)",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              Invoice
            </p>
            <h1 className="mt-2 font-mono text-3xl font-black tracking-tight">
              {inv.number}
            </h1>
            <p className="mt-3 text-base font-semibold">{businessName}</p>
          </div>
          <div className="rounded-xl bg-white/15 p-4 text-right backdrop-blur">
            <p className="text-xs uppercase tracking-wider text-white/80">
              Amount due
            </p>
            <p className="mt-1 text-3xl font-black tabular-nums">
              {formatMoney(Number(inv.total), inv.currency)}
            </p>
            {inv.due_date && (
              <p className="mt-1 text-xs text-white/80">
                Due {new Date(inv.due_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-8 md:p-10">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Billed to
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              {inv.client_name}
            </p>
            {inv.client_email && (
              <p className="text-sm text-slate-600">{inv.client_email}</p>
            )}
          </div>
          <div className="md:text-right">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Issued
            </p>
            <p className="mt-1 font-medium text-slate-900">
              {new Date(inv.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <LineItems inv={inv} />
        </div>

        <div className="mt-6">
          <Totals inv={inv} accent="#6366f1" />
        </div>

        {inv.notes && (
          <div className="mt-8 rounded-lg bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Notes
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
              {inv.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function MinimalTemplate({
  invoice: inv,
  businessName,
}: {
  invoice: Invoice;
  businessName: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-10 shadow-sm md:p-14">
      <div className="flex flex-wrap items-baseline justify-between gap-6 border-b border-slate-900 pb-8">
        <div>
          <h1 className="font-serif text-5xl font-black tracking-tight text-slate-900">
            Invoice
          </h1>
          <p className="mt-2 font-mono text-sm uppercase tracking-[0.25em] text-slate-500">
            {inv.number}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            From
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {businessName}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            Billed to
          </p>
          <p className="mt-2 font-semibold text-slate-900">
            {inv.client_name}
          </p>
          {inv.client_email && (
            <p className="text-sm text-slate-600">{inv.client_email}</p>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            Issued
          </p>
          <p className="mt-2 font-medium">
            {new Date(inv.created_at).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            Due
          </p>
          <p className="mt-2 font-medium">
            {inv.due_date
              ? new Date(inv.due_date).toLocaleDateString()
              : "On receipt"}
          </p>
        </div>
      </div>

      <div className="mt-10">
        <LineItems inv={inv} />
      </div>

      <div className="mt-6">
        <Totals inv={inv} accent="#111827" />
      </div>

      {inv.notes && (
        <div className="mt-10 border-t border-slate-200 pt-6">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            Notes
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
            {inv.notes}
          </p>
        </div>
      )}
    </div>
  );
}
