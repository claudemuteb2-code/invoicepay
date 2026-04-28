"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Global keyboard shortcuts inside the dashboard.
 * - `n` → /dashboard/invoices/new
 * - `c` → /dashboard/clients/new
 * - `/` → focus the first input with [data-search]
 * Shortcuts are ignored while typing in inputs / textareas / contenteditable.
 */
export default function ShortcutsProvider() {
  const router = useRouter();

  useEffect(() => {
    function isTyping(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return true;
      if (target.isContentEditable) return true;
      return false;
    }

    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTyping(e.target)) return;
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        router.push("/dashboard/invoices/new");
      } else if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        router.push("/dashboard/clients/new");
      } else if (e.key === "/") {
        const el = document.querySelector<HTMLInputElement>("[data-search]");
        if (el) {
          e.preventDefault();
          el.focus();
          el.select();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return null;
}
