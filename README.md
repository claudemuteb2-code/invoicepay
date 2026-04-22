# InvoicePay

Send professional invoices and collect payments via PayPal in under 30 seconds.

Built for freelancers who are tired of chasing clients. Free to start, $9/mo for
unlimited invoices.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase
(Postgres + Auth) · PayPal (subscriptions + one-off orders). Runs entirely on
free tiers.

---

## Features

- Email + password auth (Supabase)
- Create / edit / delete invoices with multiple line items, tax, notes, due dates
- Public shareable invoice link (`/i/[token]`) with a PayPal Pay button — clients
  can pay with PayPal balance, card, or as a guest
- Dashboard with outstanding / paid totals
- Free tier: 3 invoices / month; Pro tier ($9/mo) unlocks unlimited
- PayPal subscription for Pro billing with webhook-driven state sync

---

## Quick start (local dev)

```bash
git clone https://github.com/<your-account>/invoicepay.git
cd invoicepay
cp .env.example .env.local   # fill in values (see below)
npm install
npm run dev
```

Then open http://localhost:3000.

---

## 1. Set up Supabase (free tier)

1. Go to <https://supabase.com> → **New project**. Pick any region; use the free
   plan.
2. Once the project is ready, open **SQL editor** → **New query** and paste the
   full contents of [`supabase/schema.sql`](supabase/schema.sql). Click **Run**.
3. Go to **Project settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret)
4. Go to **Authentication → URL Configuration** and set the **Site URL** to
   your production URL (e.g. `https://<your-domain>`). Add to the **Redirect
   URLs** list both `http://localhost:3000/auth/callback` and
   `https://<your-domain>/auth/callback` (used only if you re-enable email
   confirmation later).
5. Go to **Authentication → Providers → Email**. Make sure **Enable Email
   provider** is on, and **turn OFF "Confirm email"** so signups are instant.
   (If you leave it on, new users must click a confirmation link before they
   can sign in.) Click **Save**.

That's it for the database.

---

## 2. Set up PayPal

You need two things:

### A) REST API app (client id + secret)

1. Go to <https://developer.paypal.com/dashboard/applications> and log in.
2. Switch to **Sandbox** for testing (use Live for real money later).
3. **Apps & Credentials → Create App**. Name it `InvoicePay`, type "Merchant".
4. Copy the **Client ID** → `NEXT_PUBLIC_PAYPAL_CLIENT_ID`.
5. Copy the **Secret** → `PAYPAL_CLIENT_SECRET`.

### B) Subscription plan (for the $9/mo Pro tier)

PayPal subscriptions are keyed off a **Plan ID**. Create one once per
environment using the REST API:

```bash
# 1. Get an access token
TOKEN=$(curl -s -u "$NEXT_PUBLIC_PAYPAL_CLIENT_ID:$PAYPAL_CLIENT_SECRET" \
  https://api-m.sandbox.paypal.com/v1/oauth2/token \
  -d "grant_type=client_credentials" | jq -r .access_token)

# 2. Create a product
PRODUCT_ID=$(curl -s -X POST \
  https://api-m.sandbox.paypal.com/v1/catalogs/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "InvoicePay Pro",
    "type": "SERVICE",
    "category": "SOFTWARE"
  }' | jq -r .id)

# 3. Create the $9/mo plan
curl -s -X POST \
  https://api-m.sandbox.paypal.com/v1/billing/plans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"product_id\": \"$PRODUCT_ID\",
    \"name\": \"InvoicePay Pro Monthly\",
    \"billing_cycles\": [{
      \"frequency\": { \"interval_unit\": \"MONTH\", \"interval_count\": 1 },
      \"tenure_type\": \"REGULAR\",
      \"sequence\": 1,
      \"total_cycles\": 0,
      \"pricing_scheme\": {
        \"fixed_price\": { \"value\": \"9\", \"currency_code\": \"USD\" }
      }
    }],
    \"payment_preferences\": {
      \"auto_bill_outstanding\": true,
      \"setup_fee_failure_action\": \"CANCEL\",
      \"payment_failure_threshold\": 1
    }
  }" | jq -r .id
```

Copy the returned plan id (starts with `P-...`) → `PAYPAL_PLAN_ID`.

You can also create the plan through the PayPal dashboard UI under
**Pay with PayPal → Products → Create plan**.

### C) Webhook

After deploying (see step 3), register a webhook:

1. **Apps & Credentials → your app → Sandbox Webhooks → Add Webhook**.
2. URL: `https://<your-domain>/api/paypal/webhook`
3. Subscribe to these events:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `BILLING.SUBSCRIPTION.UPDATED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `PAYMENT.SALE.COMPLETED`
   - `PAYMENT.CAPTURE.COMPLETED`
   - `CHECKOUT.ORDER.APPROVED`
4. Copy the **Webhook ID** → `PAYPAL_WEBHOOK_ID`.

---

## 3. Deploy to Vercel (free tier)

### Step-by-step

1. Push this repo to GitHub (you're reading this from there).
2. Go to <https://vercel.com/new> → **Import Git Repository** → select
   `invoicepay`.
3. Framework preset: **Next.js** (auto-detected).
4. Under **Environment Variables**, paste every variable from `.env.example`
   with the real values you gathered above:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | from Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | from Supabase (mark as secret) |
   | `PAYPAL_ENV` | `sandbox` (switch to `live` later) |
   | `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | from PayPal |
   | `PAYPAL_CLIENT_SECRET` | from PayPal (mark as secret) |
   | `PAYPAL_PLAN_ID` | from PayPal (the `P-...` id) |
   | `PAYPAL_WEBHOOK_ID` | from PayPal webhook |
   | `NEXT_PUBLIC_APP_URL` | your Vercel URL, e.g. `https://invoicepay.vercel.app` |

5. Click **Deploy**. Wait ~1 minute.
6. Open your new URL. Register the PayPal webhook pointing to
   `https://<that-url>/api/paypal/webhook` (section 2C above).
7. Back in **Supabase → Authentication → URL Configuration** add
   `https://<that-url>/auth/callback` to the redirect URL list.
8. Redeploy (Vercel → Deployments → "…" → Redeploy) if you changed any
   env vars.

### Going live (when ready to take real money)

1. In PayPal, switch from Sandbox to Live and repeat 2A / 2B / 2C with live
   credentials.
2. Update the Vercel env vars: `PAYPAL_ENV=live`, and replace the client id,
   secret, plan id, and webhook id with live values.
3. Redeploy.

---

## Project structure

```
src/
  app/
    page.tsx               # landing page
    login/                 # magic-link sign-in
    auth/callback/         # Supabase OAuth/magic-link callback
    auth/signout/          # POST /auth/signout
    dashboard/             # logged-in area (invoices, settings, billing)
    i/[token]/             # public shareable invoice + PayPal pay button
    api/
      invoices/            # POST / PATCH / DELETE invoices
      paypal/
        subscribe/         # activate Pro after client-side PayPal approval
        create-order/      # create one-off PayPal order for invoice payment
        capture-order/     # capture the order after client approves
        webhook/           # PayPal webhook handler
  components/              # shared UI
  lib/
    supabase/{client,server,admin}.ts
    paypal.ts              # tiny PayPal REST client + webhook verifier
    utils.ts
  types/db.ts
supabase/schema.sql        # run once in Supabase SQL editor
```

---

## How billing works

- **Pro subscription**: user clicks the PayPal button on `/dashboard/billing`;
  the client-side SDK creates a subscription against `PAYPAL_PLAN_ID`. On
  approval we call `/api/paypal/subscribe` which verifies the status with
  PayPal and flips the user's `profiles.plan` to `pro`. The webhook keeps this
  in sync when the subscription is activated, renewed, suspended, or cancelled.
- **Invoice payments**: the public invoice page calls
  `/api/paypal/create-order` → PayPal SDK renders a Pay button → on approval
  we call `/api/paypal/capture-order` which captures and marks the invoice
  `paid`. Redundant confirmation comes via the `PAYMENT.CAPTURE.COMPLETED`
  webhook.
- All webhook events are logged to `public.webhook_events` for idempotency.

---

## License

MIT
