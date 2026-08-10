import {
  initializeProviderPayment,
  verifyProviderPayment,
  type PaymentInitializationPayload,
  type PaymentInitializationResult,
  type PaymentVerificationPayload,
  type PaymentVerificationResult,
} from "@/lib/payment-router";

async function postJson<T>(url: string, body: unknown): Promise<T | null> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) return null; // static hosting: no server route
    const data = (await response.json()) as T & { error?: string };
    if (!response.ok && !("success" in (data as object))) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Initializes a payment. Uses the server route when the app is served with SSR,
 * and falls back to the in-browser sandbox router on static (Truehost) hosting.
 */
export async function initializePayment(
  payload: PaymentInitializationPayload,
): Promise<PaymentInitializationResult> {
  const viaServer = await postJson<PaymentInitializationResult>("/api/payments/initialize", payload);
  if (viaServer && viaServer.provider) return viaServer;
  return initializeProviderPayment(payload);
}

/** Verifies a payment, falling back to the in-browser sandbox router on static hosting. */
export async function verifyPayment(
  payload: PaymentVerificationPayload,
): Promise<PaymentVerificationResult> {
  const viaServer = await postJson<PaymentVerificationResult>("/api/payments/verify", payload);
  if (viaServer && typeof viaServer.success === "boolean") return viaServer;
  return verifyProviderPayment(payload);
}
