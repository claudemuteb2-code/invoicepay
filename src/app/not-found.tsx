import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-3xl font-bold">Not found</h1>
      <p className="mt-2 text-slate-600">
        That page or invoice doesn't exist.
      </p>
      <Link href="/" className="btn-primary mt-6 inline-flex">
        Go home
      </Link>
    </main>
  );
}
