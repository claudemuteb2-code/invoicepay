import Link from "next/link";
import type { PlanId } from "@/lib/plans";

type Props = {
  title: string;
  description: string;
  eta?: string;
  requiresPlan?: PlanId;
};

export default function ComingSoon({
  title,
  description,
  eta,
  requiresPlan,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>

      <div className="card flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
            aria-hidden
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Coming soon
          </h2>
          <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
            We&apos;re shipping this feature in {eta || "an upcoming release"}.
            {requiresPlan && (
              <>
                {" "}It&apos;ll be available on the{" "}
                <span className="font-semibold capitalize">{requiresPlan}</span>{" "}
                plan and above.
              </>
            )}
          </p>
        </div>
        <Link href="/dashboard" className="btn-secondary">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
