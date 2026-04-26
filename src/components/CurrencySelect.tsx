"use client";

import { CURRENCIES } from "@/lib/currencies";

type Props = {
  value: string;
  onChange: (code: string) => void;
  id?: string;
};

export default function CurrencySelect({ value, onChange, id }: Props) {
  return (
    <select
      id={id}
      className="input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {CURRENCIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.code} — {c.label} ({c.symbol})
        </option>
      ))}
    </select>
  );
}
