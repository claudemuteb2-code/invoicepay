import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { computeInvoiceTotals } from "@/lib/utils";
import type { InvoiceItem } from "@/types/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    client_name?: string;
    client_email?: string | null;
    currency?: string;
    items?: InvoiceItem[];
    tax_rate?: number;
    due_date?: string | null;
    notes?: string | null;
    status?: string;
  };

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const k of [
    "client_name",
    "client_email",
    "currency",
    "items",
    "tax_rate",
    "due_date",
    "notes",
    "status",
  ] as const) {
    if (k in body) patch[k] = body[k] as never;
  }

  if (body.items) {
    const totals = computeInvoiceTotals(body.items, body.tax_rate ?? 0);
    patch.subtotal = totals.subtotal;
    patch.tax_amount = totals.taxAmount;
    patch.total = totals.total;
  }

  const { data: invoice, error } = await supabase
    .from("invoices")
    .update(patch)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ invoice });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
