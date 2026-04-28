import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "company_name, full_name, address, phone, paypal_email, email, default_currency, default_tax_rate, default_payment_terms, invoice_prefix, invoice_footer",
    )
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Defaults that apply to every invoice you send.
        </p>
      </div>
      <SettingsForm
        initial={{
          full_name: profile?.full_name ?? "",
          company_name: profile?.company_name ?? "",
          address: profile?.address ?? "",
          phone: profile?.phone ?? "",
          paypal_email: profile?.paypal_email ?? "",
          email: profile?.email ?? user.email ?? "",
          default_currency: profile?.default_currency ?? "USD",
          default_tax_rate: Number(profile?.default_tax_rate ?? 0),
          default_payment_terms: profile?.default_payment_terms ?? "net_30",
          invoice_prefix: profile?.invoice_prefix ?? "INV",
          invoice_footer: profile?.invoice_footer ?? "",
        }}
      />
    </div>
  );
}
