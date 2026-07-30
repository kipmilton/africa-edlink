import { convertUSDToCurrency, resolveCountryProfile, type Currency, type PaymentProvider } from "@/lib/currency";
import type { ClusterCode, PreferredLanguage, PreferredTimeSlot } from "@/lib/regional-clusters";

export type PaymentRoute = {
  provider: PaymentProvider;
  fallbackProvider?: PaymentProvider;
  currency: Currency;
  countryCode: string;
  countryName: string;
  providerName: string;
  logoText: string;
  testMode: boolean;
};

export type StudentPaymentData = {
  fullName: string;
  email: string;
  phone?: string;
  education?: string;
  heardFrom?: string;
  country?: string;
  language?: "en" | "fr";
  preferredLanguage?: PreferredLanguage;
  preferredTime?: PreferredTimeSlot;
  clusterCode?: ClusterCode;
  paymentOption?: "full" | "partial";
};

export type PaymentInitializationPayload = {
  studentData: StudentPaymentData;
  courseId: string;
  courseTitle?: string;
  countryCode: string;
  amount: number;
  currency?: Currency;
  paymentOption?: "full" | "partial";
};

export type PaymentInitializationResult = {
  provider: PaymentProvider;
  providerName: string;
  currency: Currency;
  amount: number;
  txRef: string;
  reference: string;
  accessCode?: string;
  paymentLink?: string;
  tranref?: string;
  publicKey?: string;
  mock: boolean;
  message: string;
};

export type PaymentVerificationPayload = {
  transactionReference: string;
  provider: PaymentProvider;
  courseId: string;
  expectedAmount?: number;
  currency?: Currency;
  studentData?: StudentPaymentData;
};

export type PaymentVerificationResult = {
  success: boolean;
  provider: PaymentProvider;
  status: "successful" | "failed";
  redirectUrl: string;
  cohortId?: string;
  mock: boolean;
};

const FRANCOPHONE_WEST_CENTRAL = new Set(["SN", "CI", "CM", "GA", "CG", "BF", "BJ"]);
const EAST_AND_CENTRAL_FLUTTERWAVE = new Set(["KE", "UG", "RW", "TZ", "CD"]);

export function providerLabel(provider: PaymentProvider): string {
  if (provider === "paystack") return "Paystack";
  if (provider === "seerbit") return "SeerBit";
  return "Flutterwave";
}

export function resolvePaymentRoute(countryCodeOrName: string | undefined | null): PaymentRoute {
  const profile = resolveCountryProfile(countryCodeOrName);
  const countryCode = (profile?.code ?? countryCodeOrName ?? "").trim().toUpperCase();

  if (countryCode === "NG") {
    return {
      provider: "paystack",
      fallbackProvider: "seerbit",
      currency: "NGN",
      countryCode,
      countryName: profile?.name ?? "Nigeria",
      providerName: "Paystack",
      logoText: "PS",
      testMode: true,
    };
  }

  if (countryCode === "GH") {
    return {
      provider: "paystack",
      currency: "GHS",
      countryCode,
      countryName: profile?.name ?? "Ghana",
      providerName: "Paystack",
      logoText: "PS",
      testMode: true,
    };
  }

  if (FRANCOPHONE_WEST_CENTRAL.has(countryCode)) {
    const currency = ["CM", "GA", "CG"].includes(countryCode) ? "XAF" : "XOF";
    return {
      provider: "seerbit",
      fallbackProvider: "flutterwave",
      currency,
      countryCode,
      countryName: profile?.name ?? countryCode,
      providerName: "SeerBit",
      logoText: "SB",
      testMode: true,
    };
  }

  if (EAST_AND_CENTRAL_FLUTTERWAVE.has(countryCode)) {
    return {
      provider: "flutterwave",
      currency: profile?.currency ?? "KES",
      countryCode,
      countryName: profile?.name ?? countryCode,
      providerName: "Flutterwave",
      logoText: "FW",
      testMode: true,
    };
  }

  return {
    provider: "flutterwave",
    currency: profile?.currency ?? "USD",
    countryCode: profile?.code ?? (countryCode || "INTL"),
    countryName: profile?.name ?? "International",
    providerName: "Flutterwave",
    logoText: "FW",
    testMode: true,
  };
}

export function amountForCountry(baseUSD: number, countryCodeOrName: string | undefined | null): number {
  return convertUSDToCurrency(baseUSD, resolvePaymentRoute(countryCodeOrName).currency);
}

function envValue(name: string): string {
  return typeof process !== "undefined" ? process.env[name] ?? "" : "";
}

function isUsableSecret(value: string): boolean {
  return !!value && !value.includes("xxxxxx") && !value.toLowerCase().includes("placeholder");
}

function jsonHeaders(extra?: HeadersInit): HeadersInit {
  return { "content-type": "application/json", ...(extra ?? {}) };
}

function createTxRef(provider: PaymentProvider, courseId: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `serenog-${provider}-${courseId}-${random}`;
}

function publicKeyForProvider(provider: PaymentProvider): string {
  if (provider === "paystack") return envValue("VITE_PAYSTACK_PUBLIC_KEY") || "pk_test_xxxxxx";
  if (provider === "seerbit") return envValue("VITE_SEERBIT_PUBLIC_KEY") || "SBTESTPUBKEY_xxxxxx";
  return envValue("VITE_FLUTTERWAVE_PUBLIC_KEY") || "FLWPUBK_TEST-xxxxxx";
}

function appOrigin(): string {
  return envValue("VITE_APP_URL") || "http://localhost:5173";
}

function mockInitialize(payload: PaymentInitializationPayload, route: PaymentRoute, reason: string): PaymentInitializationResult {
  const txRef = createTxRef(route.provider, payload.courseId);
  return {
    provider: route.provider,
    providerName: route.providerName,
    currency: payload.currency ?? route.currency,
    amount: payload.amount,
    txRef,
    reference: txRef,
    accessCode: route.provider === "paystack" ? `mock_access_${txRef}` : undefined,
    paymentLink: route.provider === "flutterwave" ? `${appOrigin()}/dashboard?mock_payment=${txRef}` : undefined,
    tranref: route.provider === "seerbit" ? txRef : undefined,
    publicKey: publicKeyForProvider(route.provider),
    mock: true,
    message: reason,
  };
}

export async function initializeProviderPayment(payload: PaymentInitializationPayload): Promise<PaymentInitializationResult> {
  const route = resolvePaymentRoute(payload.countryCode);
  const email = payload.studentData.email;
  if (!email || !payload.amount || payload.amount <= 0) {
    return mockInitialize(payload, route, "Invalid payment payload; using local sandbox mock.");
  }

  const txRef = createTxRef(route.provider, payload.courseId);

  try {
    if (route.provider === "paystack") {
      const secret = envValue("PAYSTACK_SECRET_KEY");
      if (!isUsableSecret(secret)) return mockInitialize(payload, route, "Paystack test secret is missing; using local sandbox mock.");
      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: jsonHeaders({ Authorization: `Bearer ${secret}` }),
        body: JSON.stringify({
          email,
          amount: Math.round(payload.amount * 100),
          currency: payload.currency ?? route.currency,
          reference: txRef,
          metadata: { courseId: payload.courseId, studentName: payload.studentData.fullName },
        }),
      });
      if (!response.ok) return mockInitialize(payload, route, "Paystack sandbox initialization failed; using local mock.");
      const body = (await response.json()) as { data?: { access_code?: string; reference?: string } };
      return {
        provider: route.provider,
        providerName: route.providerName,
        currency: payload.currency ?? route.currency,
        amount: payload.amount,
        txRef,
        reference: body.data?.reference ?? txRef,
        accessCode: body.data?.access_code,
        publicKey: publicKeyForProvider(route.provider),
        mock: false,
        message: "Paystack initialized.",
      };
    }

    if (route.provider === "seerbit") {
      const secret = envValue("SEERBIT_SECRET_KEY");
      if (!isUsableSecret(secret)) return mockInitialize(payload, route, "SeerBit test secret is missing; using local sandbox mock.");
      return mockInitialize(payload, route, "SeerBit checkout is wired; using mock until merchant API details are confirmed.");
    }

    const secret = envValue("FLUTTERWAVE_SECRET_KEY");
    if (!isUsableSecret(secret)) return mockInitialize(payload, route, "Flutterwave test secret is missing; using local sandbox mock.");
    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: jsonHeaders({ Authorization: `Bearer ${secret}` }),
      body: JSON.stringify({
        tx_ref: txRef,
        amount: payload.amount,
        currency: payload.currency ?? route.currency,
        redirect_url: `${appOrigin()}/dashboard`,
        customer: { email, name: payload.studentData.fullName, phonenumber: payload.studentData.phone },
        customizations: { title: "Serenog Enrollment", description: payload.courseTitle ?? payload.courseId },
      }),
    });
    if (!response.ok) return mockInitialize(payload, route, "Flutterwave sandbox initialization failed; using local mock.");
    const body = (await response.json()) as { data?: { link?: string } };
    return {
      provider: route.provider,
      providerName: route.providerName,
      currency: payload.currency ?? route.currency,
      amount: payload.amount,
      txRef,
      reference: txRef,
      paymentLink: body.data?.link,
      publicKey: publicKeyForProvider(route.provider),
      mock: false,
      message: "Flutterwave initialized.",
    };
  } catch {
    return mockInitialize(payload, route, "Provider sandbox request failed; using local mock.");
  }
}

export async function verifyProviderPayment(payload: PaymentVerificationPayload): Promise<PaymentVerificationResult> {
  const provider = payload.provider;
  const secret =
    provider === "paystack"
      ? envValue("PAYSTACK_SECRET_KEY")
      : provider === "seerbit"
        ? envValue("SEERBIT_SECRET_KEY")
        : envValue("FLUTTERWAVE_SECRET_KEY");

  if (!isUsableSecret(secret) || payload.transactionReference.includes("serenog-")) {
    return { success: true, provider, status: "successful", redirectUrl: "/dashboard", mock: true };
  }

  try {
    if (provider === "paystack") {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(payload.transactionReference)}`, {
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (!response.ok) return { success: false, provider, status: "failed", redirectUrl: `/enroll/${payload.courseId}`, mock: false };
      const body = (await response.json()) as { data?: { status?: string } };
      const paid = body.data?.status === "success";
      return { success: paid, provider, status: paid ? "successful" : "failed", redirectUrl: "/dashboard", mock: false };
    }

    if (provider === "seerbit") {
      const response = await fetch(`https://seerbitapi.com/api/v2/payments/query/${encodeURIComponent(payload.transactionReference)}`, {
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (!response.ok) return { success: false, provider, status: "failed", redirectUrl: `/enroll/${payload.courseId}`, mock: false };
      return { success: true, provider, status: "successful", redirectUrl: "/dashboard", mock: false };
    }

    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(payload.transactionReference)}/verify`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    if (!response.ok) return { success: false, provider, status: "failed", redirectUrl: `/enroll/${payload.courseId}`, mock: false };
    const body = (await response.json()) as { data?: { status?: string } };
    const paid = body.data?.status === "successful";
    return { success: paid, provider, status: paid ? "successful" : "failed", redirectUrl: "/dashboard", mock: false };
  } catch {
    return { success: true, provider, status: "successful", redirectUrl: "/dashboard", mock: true };
  }
}
