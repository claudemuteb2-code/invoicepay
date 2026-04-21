/**
 * Minimal PayPal REST API helper. Uses the standard REST API with
 * client_credentials grant. No SDK required.
 */

const PAYPAL_BASES = {
  sandbox: "https://api-m.sandbox.paypal.com",
  live: "https://api-m.paypal.com",
} as const;

export function paypalBase() {
  const env = (process.env.PAYPAL_ENV || "sandbox") as "sandbox" | "live";
  return PAYPAL_BASES[env];
}

async function getAccessToken() {
  const id = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("PayPal credentials not configured");
  const res = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function paypalFetch(path: string, init: RequestInit = {}) {
  const token = await getAccessToken();
  const res = await fetch(`${paypalBase()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  return res;
}

/**
 * Verify a PayPal webhook signature using the documented
 * /v1/notifications/verify-webhook-signature endpoint.
 */
export async function verifyPayPalWebhook(params: {
  headers: Headers;
  rawBody: string;
}): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.warn("PAYPAL_WEBHOOK_ID not set — skipping signature verification");
    return false;
  }

  const h = params.headers;
  const body = {
    auth_algo: h.get("paypal-auth-algo"),
    cert_url: h.get("paypal-cert-url"),
    transmission_id: h.get("paypal-transmission-id"),
    transmission_sig: h.get("paypal-transmission-sig"),
    transmission_time: h.get("paypal-transmission-time"),
    webhook_id: webhookId,
    webhook_event: JSON.parse(params.rawBody),
  };

  const res = await paypalFetch("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { verification_status: string };
  return data.verification_status === "SUCCESS";
}

/** Create a one-time order to collect payment on a single invoice. */
export async function createInvoiceOrder(params: {
  amount: string;
  currency: string;
  invoiceNumber: string;
  publicToken: string;
  payeeEmail?: string | null;
}) {
  const res = await paypalFetch("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.publicToken,
          description: `Invoice ${params.invoiceNumber}`,
          amount: {
            currency_code: params.currency,
            value: params.amount,
          },
          ...(params.payeeEmail
            ? { payee: { email_address: params.payeeEmail } }
            : {}),
        },
      ],
      application_context: {
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`createInvoiceOrder failed: ${res.status} ${text}`);
  }
  return (await res.json()) as { id: string };
}

export async function captureInvoiceOrder(orderId: string) {
  const res = await paypalFetch(`/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`captureInvoiceOrder failed: ${res.status} ${text}`);
  }
  return (await res.json()) as {
    id: string;
    status: string;
    purchase_units: Array<{
      reference_id: string;
      payments?: {
        captures?: Array<{ id: string; status: string }>;
      };
    }>;
  };
}
