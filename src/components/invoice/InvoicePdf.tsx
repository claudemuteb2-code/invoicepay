"use client";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { formatMoney } from "@/lib/currencies";
import { getTemplate, type TemplateId } from "@/lib/templates";
import type { Invoice } from "@/types/db";

type Props = {
  invoice: Invoice;
  businessName: string;
  templateId?: TemplateId;
};

const base = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#0f172a",
  },
  row: { flexDirection: "row" },
  between: { flexDirection: "row", justifyContent: "space-between" },
  h1: { fontSize: 22, fontWeight: 700 },
  muted: { color: "#64748b", fontSize: 9 },
  label: {
    color: "#64748b",
    fontSize: 8,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    marginVertical: 14,
  },
  thead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 6,
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 6,
  },
  cDesc: { flex: 3 },
  cQty: { flex: 1, textAlign: "right" },
  cRate: { flex: 1.2, textAlign: "right" },
  cAmt: { flex: 1.2, textAlign: "right", fontWeight: 700 },
  totals: {
    marginLeft: "auto",
    width: 220,
    marginTop: 16,
    gap: 4,
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
    marginTop: 6,
    fontSize: 14,
    fontWeight: 700,
  },
  notes: {
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
});

export function InvoicePdf({ invoice: inv, businessName, templateId }: Props) {
  const t = getTemplate(templateId ?? inv.template);
  return (
    <Document>
      <Page size="A4" style={base.page}>
        <Header
          inv={inv}
          businessName={businessName}
          variant={t.id as TemplateId}
        />
        <View style={base.divider} />
        <View style={base.between}>
          <View>
            <Text style={base.label}>Billed to</Text>
            <Text style={{ fontWeight: 700 }}>{inv.client_name}</Text>
            {inv.client_email ? (
              <Text style={base.muted}>{inv.client_email}</Text>
            ) : null}
          </View>
          <View style={{ textAlign: "right" }}>
            <Text style={base.label}>Amount due</Text>
            <Text style={{ fontSize: 18, fontWeight: 700 }}>
              {formatMoney(Number(inv.total), inv.currency)}
            </Text>
            {inv.due_date ? (
              <Text style={base.muted}>
                Due {new Date(inv.due_date).toLocaleDateString()}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={{ marginTop: 18 }}>
          <View style={base.thead}>
            <Text style={base.cDesc}>Description</Text>
            <Text style={base.cQty}>Qty</Text>
            <Text style={base.cRate}>Rate</Text>
            <Text style={base.cAmt}>Amount</Text>
          </View>
          {inv.items.map((it, i) => (
            <View key={i} style={base.tr}>
              <Text style={base.cDesc}>{it.description}</Text>
              <Text style={base.cQty}>{it.quantity}</Text>
              <Text style={base.cRate}>
                {formatMoney(Number(it.rate), inv.currency)}
              </Text>
              <Text style={base.cAmt}>
                {formatMoney(
                  Number(it.quantity) * Number(it.rate),
                  inv.currency,
                )}
              </Text>
            </View>
          ))}
        </View>

        <View style={base.totals}>
          <View style={base.totalRow}>
            <Text style={base.muted}>Subtotal</Text>
            <Text>{formatMoney(Number(inv.subtotal), inv.currency)}</Text>
          </View>
          <View style={base.totalRow}>
            <Text style={base.muted}>Tax ({inv.tax_rate}%)</Text>
            <Text>{formatMoney(Number(inv.tax_amount), inv.currency)}</Text>
          </View>
          <View style={base.grandTotal}>
            <Text>Total</Text>
            <Text>{formatMoney(Number(inv.total), inv.currency)}</Text>
          </View>
        </View>

        {inv.notes ? (
          <View style={base.notes}>
            <Text style={base.label}>Notes</Text>
            <Text style={{ marginTop: 4 }}>{inv.notes}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

function Header({
  inv,
  businessName,
  variant,
}: {
  inv: Invoice;
  businessName: string;
  variant: TemplateId;
}) {
  if (variant === "modern") {
    return (
      <View
        style={{
          backgroundColor: "#4f46e5",
          color: "#ffffff",
          padding: 20,
          borderRadius: 8,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 6,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 8,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#e0e7ff",
            }}
          >
            Invoice
          </Text>
          <Text style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>
            {inv.number}
          </Text>
          <Text style={{ marginTop: 8, fontWeight: 700 }}>{businessName}</Text>
        </View>
        <View style={{ textAlign: "right" }}>
          <Text style={{ fontSize: 8, color: "#e0e7ff" }}>
            Issued {new Date(inv.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    );
  }
  if (variant === "minimal") {
    return (
      <View style={{ marginBottom: 6 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderBottomWidth: 2,
            borderBottomColor: "#0f172a",
            paddingBottom: 10,
          }}
        >
          <View>
            <Text style={{ fontSize: 28, fontWeight: 700 }}>Invoice</Text>
            <Text
              style={{
                marginTop: 4,
                fontSize: 8,
                letterSpacing: 2,
                color: "#64748b",
                textTransform: "uppercase",
              }}
            >
              {inv.number}
            </Text>
          </View>
          <View style={{ textAlign: "right" }}>
            <Text style={base.label}>From</Text>
            <Text style={{ fontSize: 12, fontWeight: 700 }}>
              {businessName}
            </Text>
          </View>
        </View>
      </View>
    );
  }
  // classic
  return (
    <View style={{ marginBottom: 6 }}>
      <View
        style={{ height: 4, backgroundColor: "#4f46e5", marginBottom: 14 }}
      />
      <View style={base.between}>
        <View>
          <Text style={base.label}>Invoice</Text>
          <Text style={base.h1}>{inv.number}</Text>
          <Text style={{ marginTop: 4, fontWeight: 700 }}>{businessName}</Text>
        </View>
        <View style={{ textAlign: "right" }}>
          <Text style={base.muted}>
            Issued {new Date(inv.created_at).toLocaleDateString()}
          </Text>
          {inv.due_date ? (
            <Text style={base.muted}>
              Due {new Date(inv.due_date).toLocaleDateString()}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
