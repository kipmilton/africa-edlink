export type Currency = "USD" | "KES" | "NGN" | "GHS" | "XOF" | "XAF" | "EUR" | "GBP";

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
};

const COUNTRY_CURRENCY: Record<string, Currency> = {
  // East Africa
  KE: "KES", UG: "KES", TZ: "KES", RW: "KES", ET: "KES", SO: "KES",
  // West Africa (English)
  NG: "NGN",
  GH: "GHS",
  // Francophone West Africa (XOF)
  CI: "XOF", SN: "XOF", BJ: "XOF", TG: "XOF", BF: "XOF", ML: "XOF", NE: "XOF", GW: "XOF",
  // Central Africa (XAF)
  CM: "XAF", GA: "XAF", CG: "XAF", CF: "XAF", TD: "XAF", GQ: "XAF",
  // Europe defaults for reviewers
  FR: "EUR", DE: "EUR", ES: "EUR", IT: "EUR",
  GB: "GBP",
};

export function currencyForCountry(country: string | undefined | null): Currency {
  if (!country) return "KES";
  return COUNTRY_CURRENCY[country.toUpperCase()] ?? "KES";
}

// Francophone countries — auto-select French as UI language.
const FR_COUNTRIES = new Set([
  "FR","CI","SN","BJ","TG","BF","ML","NE","GW","CM","GA","CG","CF","TD","GQ",
  "DJ","KM","MG","BI","RW","CD","LU","BE","MC","HT",
]);

export function isFrenchSpeaking(country: string | undefined | null): boolean {
  if (!country) return false;
  return FR_COUNTRIES.has(country.toUpperCase());
}

export function formatPrice(baseUSD: number, currency: Currency): string {
  const value = baseUSD * (RATES[currency] ?? 1);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "XOF" || currency === "XAF" || currency === "NGN" || currency === "KES" ? 0 : 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(0)}`;
  }
}

const CACHE_KEY = "serenog.geo";

export async function detectCountry(): Promise<{ country: string; currency: Currency }> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const p = JSON.parse(cached) as { country: string; currency: Currency; at: number };
      if (Date.now() - p.at < 24 * 60 * 60 * 1000) return { country: p.country, currency: p.currency };
    }
  } catch { /* noop */ }

  let country = "US";
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (res.ok) {
      const data = (await res.json()) as { country_code?: string };
      if (data.country_code) country = data.country_code;
    }
  } catch { /* noop — offline fallback */ }

  const currency = currencyForCountry(country);
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ country, currency, at: Date.now() })); } catch { /* noop */ }
  return { country, currency };
}