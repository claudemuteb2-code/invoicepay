"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PlanId } from "@/lib/plans";

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function SubscribeButton({
  clientId,
  planId,
  planTier,
}: {
  clientId: string;
  planId: string;
  planTier: PlanId;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !clientId || !planId || !ref.current) return;
    if (!window.paypal?.Buttons) return;

    ref.current.innerHTML = "";
    try {
      window.paypal
        .Buttons({
          style: { layout: "vertical", label: "subscribe" },
          createSubscription: (_: unknown, actions: any) =>
            actions.subscription.create({ plan_id: planId }),
          onApprove: async (data: { subscriptionID: string }) => {
            const res = await fetch("/api/paypal/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                subscriptionID: data.subscriptionID,
                planTier,
              }),
            });
            if (res.ok) router.refresh();
            else setError("Couldn't activate subscription — try refreshing.");
          },
          onError: (err: unknown) => {
            console.error(err);
            setError("PayPal error — try again.");
          },
        })
        .render(ref.current);
    } catch (err) {
      console.error(err);
    }
  }, [ready, clientId, planId, planTier, router]);

  if (!clientId) {
    return (
      <div className="text-xs text-slate-500 dark:text-slate-400">
        PayPal not configured.
      </div>
    );
  }

  return (
    <div className="w-full">
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
          clientId,
        )}&vault=true&intent=subscription`}
        onLoad={() => setReady(true)}
        strategy="afterInteractive"
      />
      <div ref={ref} />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
