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
    .select("business_name, paypal_email, email")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <SettingsForm
        initial={{
          business_name: profile?.business_name ?? "",
          paypal_email: profile?.paypal_email ?? "",
          email: profile?.email ?? user.email ?? "",
        }}
      />
    </div>
  );
}
