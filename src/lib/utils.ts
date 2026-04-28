export { formatMoney } from "./currencies";

export function computeInvoiceTotals(
  items: Array<{ quantity: number; rate: number }>,
  taxRate: number,
) {
  const subtotal = items.reduce(
    (sum, i) => sum + Number(i.quantity || 0) * Number(i.rate || 0),
    0,
  );
  const taxAmount = +(subtotal * (Number(taxRate || 0) / 100)).toFixed(2);
  const total = +(subtotal + taxAmount).toFixed(2);
  return {
    subtotal: +subtotal.toFixed(2),
    taxAmount,
    total,
  };
}

export function generateInvoiceNumber(prefix: string = "INV") {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  const safe = (prefix || "INV").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 8) || "INV";
  return `${safe}-${y}${m}-${rand}`;
}
