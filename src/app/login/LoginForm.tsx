"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/dashboard";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const supabase = createSupabaseBrowserClient();
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.session) {
          router.push(next);
          router.refresh();
          return;
        }
        setInfo(
          "Check your email to confirm your account, then sign in. (Admin: disable 'Confirm email' in Supabase to skip this step.)",
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card mt-6">
      <div className="mb-6 grid grid-cols-2 overflow-hidden rounded-md border border-slate-200">
        <button
          type="button"
          className={`py-2 text-sm font-semibold transition ${
            mode === "signin"
              ? "bg-brand text-white"
              : "bg-white text-slate-700 hover:bg-slate-50"
          }`}
          onClick={() => {
            setMode("signin");
            setError(null);
            setInfo(null);
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`py-2 text-sm font-semibold transition ${
            mode === "signup"
              ? "bg-brand text-white"
              : "bg-white text-slate-700 hover:bg-slate-50"
          }`}
          onClick={() => {
            setMode("signup");
            setError(null);
            setInfo(null);
          }}
        >
          Create account
        </button>
      </div>

      <h1 className="text-2xl font-bold">
        {mode === "signin"
          ? "Sign in to InvoicePay"
          : "Create your free account"}
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        {mode === "signin"
          ? "Enter your email and password."
          : "3 free invoices / month. No credit card required."}
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            minLength={6}
            required
          />
          {mode === "signup" && (
            <p className="mt-1 text-xs text-slate-500">
              At least 6 characters.
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {info && (
          <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
            {info}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading
            ? "…"
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>
    </div>
  );
}
