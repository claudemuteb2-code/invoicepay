import ComingSoon from "@/components/ComingSoon";

export const dynamic = "force-dynamic";

export default function RecurringPage() {
  return (
    <ComingSoon
      title="Recurring invoices"
      description="Schedule invoices to send weekly, monthly, quarterly, or yearly — fully on autopilot."
      eta="Phase 7"
      requiresPlan="pro"
    />
  );
}
