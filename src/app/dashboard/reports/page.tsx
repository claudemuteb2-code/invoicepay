import ComingSoon from "@/components/ComingSoon";

export const dynamic = "force-dynamic";

export default function ReportsPage() {
  return (
    <ComingSoon
      title="Reports"
      description="Revenue trends, invoice status breakdowns, and exportable financial reports."
      eta="Phase 8"
      requiresPlan="pro"
    />
  );
}
