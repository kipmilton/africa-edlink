export type Currency = "USD" | "KES" | "NGN" | "GHS" | "XOF" | "XAF" | "EUR" | "GBP" | "GMD" | "SSP" | "UGX" | "TZS" | "RWF" | "ZMW" | "ZWL" | "MWK" | "LRD" | "SLE" | "GNF" | "MRU" | "BIF" | "DJF" | "KMF" | "CDF" | "STN";
export type PaymentProvider = "paystack" | "flutterwave" | "cinetpay";
export type UiLang = "en" | "fr";

export type CountryProfile = {
  name: string;
  code: string;
  language: UiLang;
  paymentProvider: PaymentProvider;
  currency: Currency;
};

// Static reference FX (USD -> currency). Illustrative only.
const RATES: Record<Currency, number> = {
  USD: 1,
  KES: 129,
  NGN: 1600,
  GHS: 15,
  XOF: 600,
  XAF: 600,
  EUR: 0.92,
  GBP: 0.79,
  GMD: 73,
  SSP: 5800,
  UGX: 3800,
  TZS: 2700,
  RWF: 1280,
  ZMW: 27,
  ZWL: 360,
  MWK: 1750,
  LRD: 200,
  SLE: 23000,
  GNF: 8600,
  MRU: 40,
  BIF: 2800,
  DJF: 177000,
  KMF: 450,
  CDF: 2550,
  STN: 22,
};

const COUNTRY_OPTIONS: CountryProfile[] = [
  { name: "Ghana", code: "GH", language: "en", paymentProvider: "paystack", currency: "GHS" },
  { name: "Nigeria", code: "NG", language: "en", paymentProvider: "paystack", currency: "NGN" },
  { name: "Liberia", code: "LR", language: "en", paymentProvider: "flutterwave", currency: "LRD" },
  { name: "Sierra Leone", code: "SL", language: "en", paymentProvider: "flutterwave", currency: "SLE" },
  { name: "The Gambia", code: "GM", language: "en", paymentProvider: "flutterwave", currency: "GMD" },
  { name: "Kenya", code: "KE", language: "en", paymentProvider: "flutterwave", currency: "KES" },
  { name: "Uganda", code: "UG", language: "en", paymentProvider: "flutterwave", currency: "UGX" },
  { name: "Tanzania", code: "TZ", language: "en", paymentProvider: "flutterwave", currency: "TZS" },
  { name: "Rwanda", code: "RW", language: "en", paymentProvider: "flutterwave", currency: "RWF" },
  { name: "South Sudan", code: "SS", language: "en", paymentProvider: "flutterwave", currency: "SSP" },
  { name: "Zambia", code: "ZM", language: "en", paymentProvider: "flutterwave", currency: "ZMW" },
  { name: "Zimbabwe", code: "ZW", language: "en", paymentProvider: "flutterwave", currency: "ZWL" },
  { name: "Malawi", code: "MW", language: "en", paymentProvider: "flutterwave", currency: "MWK" },
  { name: "Benin", code: "BJ", language: "fr", paymentProvider: "cinetpay", currency: "XOF" },
  { name: "Burkina Faso", code: "BF", language: "fr", paymentProvider: "cinetpay", currency: "XOF" },
  { name: "Côte d'Ivoire", code: "CI", language: "fr", paymentProvider: "cinetpay", currency: "XOF" },
  { name: "Guinea", code: "GN", language: "fr", paymentProvider: "cinetpay", currency: "GNF" },
  { name: "Mali", code: "ML", language: "fr", paymentProvider: "cinetpay", currency: "XOF" },
  { name: "Niger", code: "NE", language: "fr", paymentProvider: "cinetpay", currency: "XOF" },
  { name: "Senegal", code: "SN", language: "fr", paymentProvider: "cinetpay", currency: "XOF" },
  { name: "Togo", code: "TG", language: "fr", paymentProvider: "cinetpay", currency: "XOF" },
  { name: "Mauritania", code: "MR", language: "fr", paymentProvider: "cinetpay", currency: "MRU" },
  { name: "Guinea-Bissau", code: "GW", language: "fr", paymentProvider: "cinetpay", currency: "XOF" },
  { name: "Burundi", code: "BI", language: "fr", paymentProvider: "cinetpay", currency: "BIF" },
  { name: "Djibouti", code: "DJ", language: "fr", paymentProvider: "cinetpay", currency: "DJF" },
  { name: "Comoros", code: "KM", language: "fr", paymentProvider: "cinetpay", currency: "KMF" },
  { name: "Cameroon", code: "CM", language: "fr", paymentProvider: "cinetpay", currency: "XAF" },
  { name: "Central African Republic", code: "CF", language: "fr", paymentProvider: "cinetpay", currency: "XAF" },
  { name: "Chad", code: "TD", language: "fr", paymentProvider: "cinetpay", currency: "XAF" },
  { name: "Democratic Republic of the Congo", code: "CD", language: "fr", paymentProvider: "cinetpay", currency: "CDF" },
  { name: "Republic of the Congo", code: "CG", language: "fr", paymentProvider: "cinetpay", currency: "XAF" },
  { name: "Gabon", code: "GA", language: "fr", paymentProvider: "cinetpay", currency: "XAF" },
  { name: "Equatorial Guinea", code: "GQ", language: "fr", paymentProvider: "cinetpay", currency: "XAF" },
  { name: "São Tomé and Príncipe", code: "ST", language: "fr", paymentProvider: "cinetpay", currency: "STN" },
];

export { COUNTRY_OPTIONS };
const COUNTRY_BY_CODE = new Map(COUNTRY_OPTIONS.map((country) => [country.code.toUpperCase(), country]));
const COUNTRY_ALIASES = new Map<string, string>([
  ["dr congo", "Democratic Republic of the Congo"],
  ["democratic republic of the congo", "Democratic Republic of the Congo"],
  ["cote divoire", "Côte d'Ivoire"],
  ["cote d'ivoire", "Côte d'Ivoire"],
  ["sao tome and principe", "São Tomé and Príncipe"],
  ["sao tome", "São Tomé and Príncipe"],
]);
const COUNTRY_BY_NAME = new Map(COUNTRY_OPTIONS.map((country) => [normalizeCountryKey(country.name), country]));
const DEFAULT_PROFILE: CountryProfile = { name: "Kenya", code: "KE", language: "en", paymentProvider: "flutterwave", currency: "KES" };
const FALLBACK_FRENCH_PROFILE: CountryProfile = { name: "France", code: "FR", language: "fr", paymentProvider: "cinetpay", currency: "EUR" };

function normalizeCountryKey(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function codeCurrencyMap(code: string): Currency | undefined {
  const upper = code.toUpperCase();
  const map: Record<string, Currency> = {
    US: "USD",
    FR: "EUR",
    DE: "EUR",
    ES: "EUR",
    IT: "EUR",
    GB: "GBP",
  };
  return map[upper];
}

export function resolveCountryProfile(country: string | undefined | null): CountryProfile | null {
  if (!country) return null;
  const normalized = normalizeCountryKey(country);
  if (!normalized) return null;
  const alias = COUNTRY_ALIASES.get(normalized);
  if (alias) {
    const byName = COUNTRY_BY_NAME.get(normalizeCountryKey(alias));
    if (byName) return byName;
  }
  const byName = COUNTRY_BY_NAME.get(normalized);
  if (byName) return byName;
  const code = country.trim().toUpperCase();
  return COUNTRY_BY_CODE.get(code) ?? null;
}

export function currencyForCountry(country: string | undefined | null): Currency {
  const profile = resolveCountryProfile(country);
  if (profile) return profile.currency;
  if (!country) return DEFAULT_PROFILE.currency;
  return codeCurrencyMap(country) ?? DEFAULT_PROFILE.currency;
}

export function isFrenchSpeaking(country: string | undefined | null): boolean {
  return resolveCountryProfile(country)?.language === "fr";
}

export function getLanguageForCountry(country: string | undefined | null): UiLang {
  return resolveCountryProfile(country)?.language ?? "en";
}

export function getPaymentProvider(country: string | undefined | null): PaymentProvider {
  return resolveCountryProfile(country)?.paymentProvider ?? "flutterwave";
}

export function getBrowserLanguage(): UiLang {
  if (typeof navigator === "undefined") return "en";
  const locale = navigator.language || navigator.languages?.[0] || "en";
  return locale.toLowerCase().startsWith("fr") ? "fr" : "en";
}

export function formatPrice(baseUSD: number, currency: Currency): string {
  const value = convertUSDToCurrency(baseUSD, currency);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: ["XOF", "XAF", "NGN", "KES", "UGX", "TZS", "RWF", "ZMW", "ZWL", "MWK", "LRD", "SLE", "GMD", "SSP", "GNF", "MRU", "BIF", "DJF", "KMF", "CDF", "STN"].includes(currency) ? 0 : 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(0)}`;
  }
}

export function convertUSDToCurrency(baseUSD: number, currency: Currency): number {
  return baseUSD * (RATES[currency] ?? 1);
}

const CACHE_KEY = "serenog.geo";

export async function detectCountry(): Promise<{ country: string; currency: Currency; profile: CountryProfile | null }> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const p = JSON.parse(cached) as { country: string; currency: Currency; profile?: CountryProfile; at: number };
      if (Date.now() - p.at < 24 * 60 * 60 * 1000) return { country: p.country, currency: p.currency, profile: p.profile ?? resolveCountryProfile(p.country) ?? null };
    }
  } catch { /* noop */ }

  let country = "";
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (res.ok) {
      const data = (await res.json()) as { country_code?: string; country_name?: string };
      if (data.country_code) country = data.country_code;
      else if (data.country_name) country = data.country_name;
    }
  } catch { /* noop — offline fallback */ }

  const profile = resolveCountryProfile(country) ?? (getBrowserLanguage() === "fr" ? FALLBACK_FRENCH_PROFILE : DEFAULT_PROFILE);
  const currency = profile.currency;
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ country: profile.name, currency, profile, at: Date.now() })); } catch { /* noop */ }
  return { country: profile.name, currency, profile };
}
