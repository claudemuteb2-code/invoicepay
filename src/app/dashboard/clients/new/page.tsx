import ComingSoon from "@/components/ComingSoon";

export const dynamic = "force-dynamic";

export default function NewClientPage() {
  return (
    <ComingSoon
      title="New client"
      description="The clients module ships in the next release."
      eta="Phase 2"
    />
  );
}
