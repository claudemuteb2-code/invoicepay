"use client";

import Link from "next/link";
import { TEMPLATES, type TemplateId } from "@/lib/templates";

type Props = {
  value: TemplateId;
  onChange: (id: TemplateId) => void;
  isPro: boolean;
};

export default function TemplatePicker({ value, onChange, isPro }: Props) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="label mb-0">Template</div>
        {!isPro && (
          <Link
            href="/dashboard/billing"
            className="text-xs font-semibold text-brand hover:underline"
          >
            Unlock Pro templates →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {TEMPLATES.map((t) => {
          const locked = t.pro && !isPro;
          const selected = value === t.id;
          return (
            <button
              key={t.id}
              type="button"
              disabled={locked}
              onClick={() => onChange(t.id)}
              className={`group relative overflow-hidden rounded-md border-2 p-3 text-left transition ${
                selected
                  ? "border-brand ring-2 ring-brand/30"
                  : "border-slate-200 hover:border-slate-300"
              } ${locked ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <TemplateSwatch id={t.id} accent={t.accent} />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-semibold">{t.name}</span>
                {t.pro && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      locked
                        ? "bg-slate-200 text-slate-600"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    Pro
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">{t.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TemplateSwatch({ id, accent }: { id: TemplateId; accent: string }) {
  if (id === "modern") {
    return (
      <div
        className="h-16 w-full rounded"
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, #a78bfa 100%)`,
        }}
      >
        <div className="flex h-full items-center justify-between px-3">
          <div className="space-y-1">
            <div className="h-1.5 w-10 rounded bg-white/80" />
            <div className="h-1 w-6 rounded bg-white/50" />
          </div>
          <div className="h-2 w-8 rounded bg-white" />
        </div>
      </div>
    );
  }
  if (id === "minimal") {
    return (
      <div className="h-16 w-full rounded border border-slate-300 bg-white">
        <div className="flex h-full flex-col justify-between p-3">
          <div className="h-1 w-8 rounded bg-slate-900" />
          <div className="flex items-end justify-between">
            <div className="h-1 w-12 rounded bg-slate-300" />
            <div className="h-2 w-10 rounded bg-slate-900" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="h-16 w-full rounded bg-slate-50 ring-1 ring-slate-200">
      <div
        className="h-3 w-full rounded-t"
        style={{ backgroundColor: accent }}
      />
      <div className="flex items-center justify-between p-2">
        <div className="space-y-1">
          <div className="h-1 w-10 rounded bg-slate-400" />
          <div className="h-1 w-6 rounded bg-slate-300" />
        </div>
        <div className="h-2 w-8 rounded" style={{ backgroundColor: accent }} />
      </div>
    </div>
  );
}
