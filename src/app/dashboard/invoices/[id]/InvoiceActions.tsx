"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InvoiceActions({
  id,
  publicUrl,
}: {
  id: string;
  publicUrl: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm("Delete this invoice?")) return;
    setBusy(true);
    const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function onCopy() {
    await navigator.clipboard.writeText(publicUrl);
    alert("Link copied!");
  }

  return (
    <div className="flex gap-2">
      <button onClick={onCopy} className="btn-secondary">
        Copy link
      </button>
      <button
        onClick={onDelete}
        disabled={busy}
        className="btn-secondary text-red-600 hover:bg-red-50"
      >
        {busy ? "…" : "Delete"}
      </button>
    </div>
  );
}
