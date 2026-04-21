"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function PayPalCheckout({
  token,
  clientId,
  currency,
}: {
  token: string;
  clientId: string;
  currency: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!ready || !ref.current || !window.paypal?.Buttons) return;
    ref.current.innerHTML = "";
    try {
      window.paypal
        .Buttons({
          style: { layout: "vertical", label: "pay" },
          createOrder: async () => {
            const res = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create order");
            return data.orderID as string;
          },
          onApprove: async (data: { orderID: string }) => {
            const res = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderID: data.orderID, token }),
            });
            if (!res.ok) {
              const d = await res.json().catch(() => ({}));
              setError(d.error || "Capture failed");
              return;
            }
            setSuccess(true);
            router.refresh();
          },
          onError: (err: unknown) => {
            console.error(err);
            setError("Payment failed — please try again.");
          },
        })
        .render(ref.current);
    } catch (err) {
      console.error(err);
    }
  }, [ready, token, router]);

  if (success) {
    return (
      <div className="rounded-md bg-emerald-50 p-4 text-sm text-emerald-800">
        Payment successful! Thank you.
      </div>
    );
  }

  return (
    <div>
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
          clientId,
        )}&currency=${encodeURIComponent(currency)}`}
        onLoad={() => setReady(true)}
        strategy="afterInteractive"
      />
      <div ref={ref} />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
