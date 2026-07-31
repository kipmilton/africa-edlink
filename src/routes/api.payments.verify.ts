import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { verifyProviderPayment, type PaymentVerificationPayload } from "@/lib/payment-router";
import { resolveRegionalCluster } from "@/lib/regional-clusters";

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

async function finalizePaidEnrollment(payload: PaymentVerificationPayload) {
  const supabase = serviceSupabase();
  if (!supabase || !payload.studentData?.email || !payload.expectedAmount || !payload.currency) return null;

  const { data: course } = await supabase
    .from("courses")
    .select("cohort_size")
    .eq("slug", payload.courseId)
    .maybeSingle();
  const cohortSize = Math.min(10, Math.max(5, Number(course?.cohort_size ?? 8)));
  const clusterCode = payload.studentData.clusterCode ?? resolveRegionalCluster(payload.studentData.country).code;
  const languageCode = payload.studentData.languageCode ?? payload.studentData.preferredLanguage ?? "en";

  const { data: cohorts } = await supabase
    .from("cohorts")
    .select("id, number")
    .eq("course_id", payload.courseId)
    .eq("cluster_code", clusterCode)
    .eq("language_code", languageCode)
    .eq("completed", false)
    .order("number", { ascending: true });

  const { data: existingEnrollments } = await supabase
    .from("enrollments")
    .select("id, cohort_id")
    .eq("course_id", payload.courseId)
    .eq("cluster_code", clusterCode)
    .eq("language_code", languageCode);

  const counts = new Map<string, number>();
  for (const enrollment of existingEnrollments ?? []) {
    const cohortId = String(enrollment.cohort_id);
    counts.set(cohortId, (counts.get(cohortId) ?? 0) + 1);
  }

  let target = (cohorts ?? []).find((cohort) => (counts.get(String(cohort.id)) ?? 0) < cohortSize);
  if (!target) {
    const nextNumber = Math.max(0, ...(cohorts ?? []).map((cohort) => Number(cohort.number))) + 1;
    const { data: newCohort, error: cohortError } = await supabase
      .from("cohorts")
      .insert({
        course_id: payload.courseId,
        number: nextNumber,
        cluster_code: clusterCode,
        language_code: languageCode,
        completed: false,
      })
      .select("id, number")
      .single();
    if (cohortError || !newCohort) return null;
    target = newCohort;
  }

  const { data: inserted, error } = await supabase
    .from("enrollments")
    .insert({
      course_id: payload.courseId,
      cohort_id: target.id,
      student_email: payload.studentData.email,
      full_name: payload.studentData.fullName,
      phone: payload.studentData.phone,
      education: payload.studentData.education,
      heard_from: payload.studentData.heardFrom,
      payment_option: payload.studentData.paymentOption ?? "full",
      payment_amount: payload.expectedAmount,
      payment_currency: payload.currency,
      payment_status: "paid",
      country: payload.studentData.country,
      language: payload.studentData.language,
      preferred_language: payload.studentData.preferredLanguage,
      preferred_time: payload.studentData.preferredTime,
      cluster_code: clusterCode,
      language_code: languageCode,
      payment_provider: payload.provider,
      transaction_reference: payload.transactionReference,
    })
    .select("id, cohort_id")
    .single();

  if (error || !inserted) return null;

  await supabase
    .from("enrollment_drafts")
    .update({ payment_status: "paid" })
    .eq("transaction_reference", payload.transactionReference);

  return { enrollmentId: inserted.id as string, cohortId: inserted.cohort_id as string };
}

export const Route = createFileRoute("/api/payments/verify")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const payload = (await request.json()) as PaymentVerificationPayload;
          const result = await verifyProviderPayment(payload);
          if (result.success) {
            const finalized = await finalizePaidEnrollment(payload);
            if (finalized?.cohortId) result.cohortId = finalized.cohortId;
          }
          return json(result, result.success ? 200 : 402);
        } catch {
          return json({ success: false, error: "Unable to verify payment." }, 400);
        }
      },
    },
  },
});
