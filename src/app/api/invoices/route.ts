import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { computeInvoiceTotals, generateInvoiceNumber } from "@/lib/utils";
import { getLimits, type PlanId } from "@/lib/plans";
import type { InvoiceItem } from "@/types/db";

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    client_name: string;
    client_email?: string | null;
    currency?: string;
    items: InvoiceItem[];
    tax_rate?: number;
    due_date?: string | null;
    notes?: string | null;
    status?: string;
    template?: string;
  };

  if (!body.client_name || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json(
      { error: "client_name and at least one line item are required" },
      { status: 400 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, invoice_prefix")
    .eq("id", user.id)
    .single();

  const planId = (profile?.plan ?? "free") as PlanId;
  const limits = getLimits(planId);

  // Enforce monthly invoice cap.
  if (limits.maxInvoicesPerMonth != null) {
    const now = new Date();
    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toISOString();
    const { count } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", monthStart);
    if ((count ?? 0) >= limits.maxInvoicesPerMonth) {
      return NextResponse.json(
        {
          error: `You've reached your plan's limit of ${limits.maxInvoicesPerMonth} invoices this month. Upgrade for more.`,
        },
        { status: 402 },
      );
    }
  }

  const totals = computeInvoiceTotals(body.items, body.tax_rate ?? 0);

  // Template gating: Free → classic only. Starter+ → 3 templates. Pro+ → all.
  const requestedTemplate = body.template ?? "classic";
  const allowedTemplates =
    limits.templateCount >= 6
      ? ["classic", "modern", "minimal"]
      : limits.templateCount >= 3
        ? ["classic", "modern", "minimal"]
        : ["classic"];
  const template = allowedTemplates.includes(requestedTemplate)
    ? requestedTemplate
    : "classic";

  const prefix = (profile?.invoice_prefix as string | null) || "INV";

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      user_id: user.id,
      number: generateInvoiceNumber(prefix),
      status: body.status ?? "draft",
      client_name: body.client_name,
      client_email: body.client_email ?? null,
      currency: body.currency ?? "USD",
      items: body.items,
      subtotal: totals.subtotal,
      tax_rate: body.tax_rate ?? 0,
      tax_amount: totals.taxAmount,
      total: totals.total,
      notes: body.notes ?? null,
      due_date: body.due_date ?? null,
      template,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ invoice });
}
