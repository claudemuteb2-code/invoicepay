import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
        ← Back
      </Link>
      <Suspense fallback={<div className="card mt-6">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
