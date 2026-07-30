import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { initializeProviderPayment, type PaymentInitializationPayload } from "@/lib/payment-router";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function serviceSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function saveDraft(payload: PaymentInitializationPayload, result: Awaited<ReturnType<typeof initializeProviderPayment>>) {
  const supabase = serviceSupabase();
  if (!supabase) return;
  await supabase.from("enrollment_drafts").insert({
    course_id: payload.courseId,
    student_email: payload.studentData.email,
    student_data: payload.studentData,
    country_code: payload.countryCode,
    cluster_code: payload.studentData.clusterCode,
    preferred_language: payload.studentData.preferredLanguage,
    preferred_time: payload.studentData.preferredTime,
    payment_provider: result.provider,
    payment_amount: payload.amount,
    payment_currency: payload.currency ?? result.currency,
    transaction_reference: result.reference,
    payment_status: "pending",
  });
}

export const Route = createFileRoute("/api/payments/initialize")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const payload = (await request.json()) as PaymentInitializationPayload;
          const result = await initializeProviderPayment(payload);
          await saveDraft(payload, result);
          return json(result);
        } catch {
          return json({ error: "Unable to initialize payment." }, 400);
        }
      },
    },
  },
});
