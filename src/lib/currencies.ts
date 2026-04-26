export type CurrencyCode =
  | "USD"
  | "EUR"
  | "GBP"
  | "CAD"
  | "AUD"
  | "JPY"
  | "CHF"
  | "SGD"
  | "AED"
  | "INR"
  | "MXN"
  | "BRL"
  | "NGN"
  | "ZAR"
  | "KES";

export const CURRENCIES: {
  code: CurrencyCode;
  symbol: string;
  label: string;
  locale: string;
}[] = [
  { code: "USD", symbol: "$", label: "US Dollar", locale: "en-US" },
  { code: "EUR", symbol: "€", label: "Euro", locale: "en-IE" },
  { code: "GBP", symbol: "£", label: "British Pound", locale: "en-GB" },
  { code: "CAD", symbol: "CA$", label: "Canadian Dollar", locale: "en-CA" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar", locale: "en-AU" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen", locale: "ja-JP" },
  { code: "CHF", symbol: "CHF", label: "Swiss Franc", locale: "de-CH" },
  { code: "SGD", symbol: "S$", label: "Singapore Dollar", locale: "en-SG" },
  { code: "AED", symbol: "د.إ", label: "UAE Dirham", locale: "en-AE" },
  { code: "INR", symbol: "₹", label: "Indian Rupee", locale: "en-IN" },
  { code: "MXN", symbol: "MX$", label: "Mexican Peso", locale: "es-MX" },
  { code: "BRL", symbol: "R$", label: "Brazilian Real", locale: "pt-BR" },
  { code: "NGN", symbol: "₦", label: "Nigerian Naira", locale: "en-NG" },
  { code: "ZAR", symbol: "R", label: "South African Rand", locale: "en-ZA" },
  { code: "KES", symbol: "KSh", label: "Kenyan Shilling", locale: "en-KE" },
];

const CURRENCIES_BY_CODE = new Map(CURRENCIES.map((c) => [c.code, c]));

export function getCurrency(code: string) {
  return CURRENCIES_BY_CODE.get(code as CurrencyCode) ?? CURRENCIES[0];
}

export function currencySymbol(code: string) {
  return getCurrency(code).symbol;
}

/**
 * Locale-aware currency formatter. Always returns a valid string even if
 * Node / the browser does not know the locale-currency pair.
 */
export function formatMoney(amount: number, code: string = "USD") {
  const { locale } = getCurrency(code);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
    }).format(amount);
  } catch {
    return `${currencySymbol(code)} ${amount.toFixed(2)}`;
  }
}
