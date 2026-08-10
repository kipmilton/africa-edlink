import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useApp } from "@/lib/app-context";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { COUNTRY_OPTIONS, convertUSDToCurrency, formatPrice, type PaymentProvider } from "@/lib/currency";
import { providerLabel, resolvePaymentRoute, type PaymentInitializationResult } from "@/lib/payment-router";
import { initializePayment, verifyPayment } from "@/lib/payments-client";
import {
  PREFERRED_TIME_OPTIONS,
  clusterLabel,
  clusterTimezone,
  resolveRegionalCluster,
  type PreferredLanguage,
  type PreferredTimeSlot,
} from "@/lib/regional-clusters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

function loadCheckoutScript(id: string, src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById(id)) return resolve(true);
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export const Route = createFileRoute("/enroll/$id")({
  head: () => ({ meta: [{ title: "Enroll — Serencog Technologies" }] }),
  component: EnrollPage,
});

function EnrollPage() {
  const { id } = useParams({ from: "/enroll/$id" });
  const { courses, currency, enroll, cohorts, setLang, lang, country: detectedCountry } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const course = courses.find((c) => c.id === id);

  const [authEmail, setAuthEmail] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPass, setAuthPass] = useState("");

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [education, setEducation] = useState("Bachelor's Degree");
  const [heard, setHeard] = useState("Google Search");
  const [country, setCountry] = useState(detectedCountry || "");
  const [preferredTime, setPreferredTime] = useState<PreferredTimeSlot>("5-7");
  const [preferredLanguage, setPreferredLanguage] = useState<PreferredLanguage>("en");
  const [languageChosen, setLanguageChosen] = useState(false);
  const [payOption, setPayOption] = useState<"full" | "partial">("full");
  const [partialAmount, setPartialAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const selectedCountry = useMemo(() => COUNTRY_OPTIONS.find((item) => item.name === country || item.code === country), [country]);
  const selectedLanguage = selectedCountry?.language ?? lang;
  const paymentRoute = useMemo(() => resolvePaymentRoute(selectedCountry?.code ?? country), [selectedCountry?.code, country]);
  const selectedCluster = useMemo(() => resolveRegionalCluster(selectedCountry?.code ?? country), [selectedCountry?.code, country]);
  const selectedCurrency = paymentRoute.currency ?? currency;
  const selectedPaymentProvider = paymentRoute.provider as PaymentProvider;
  const minimumPartialAmount = convertUSDToCurrency(10, selectedCurrency);
  const fullAmount = convertUSDToCurrency(course?.basePriceUSD ?? 0, selectedCurrency);

  useEffect(() => {
    if (selectedCountry && selectedLanguage !== lang) {
      setLang(selectedLanguage, { persist: false });
    }
  }, [selectedCountry, selectedLanguage, lang, setLang]);

  useEffect(() => {
    if (!languageChosen) setPreferredLanguage(selectedCluster.language);
  }, [selectedCluster.language, languageChosen]);

  if (!course) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Course not found</h1>
        <Button asChild className="mt-4"><Link to="/courses">Back to courses</Link></Button>
      </div>
    );
  }

  const nextCohortNumber = (() => {
    const active = cohorts.filter(
      (c) =>
        c.courseId === course.id &&
        c.clusterCode === selectedCluster.code &&
        (c.languageCode ?? "en") === preferredLanguage &&
        !c.completed,
    );
    const last = active[active.length - 1];
    if (!last || last.studentIds.length >= course.cohortSize) return (active.length || 0) + 1;
    return last.number;
  })();

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPass) return toast.error("Enter your email and password");
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPass });
    if (error) return toast.error(error.message);
    setEmail(authEmail);
    setFullName(authName || authEmail.split("@")[0]);
    toast.success("Signed in");
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPass) return toast.error("Enter your email and password");
    const { error } = await supabase.auth.signUp({
      email: authEmail,
      password: authPass,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: authName },
      },
    });
    if (error) return toast.error(error.message);
    toast.success("Account created — check your email to confirm, then sign in.");
  };

  const getAmountToRecord = () => {
    const amountToRecord = payOption === "full" ? fullAmount : Number(partialAmount);
    if (payOption === "partial") {
      if (!Number.isFinite(amountToRecord)) return toast.error("Enter a valid partial payment amount");
      if (amountToRecord <= minimumPartialAmount) {
        return toast.error(`Partial amount must be more than ${formatPrice(10, selectedCurrency)}`);
      }
      if (amountToRecord > fullAmount) {
        return toast.error("Partial amount cannot be more than the full tuition amount");
      }
    }
    return amountToRecord;
  };

  const finalizeEnrollment = async (transactionReference: string) => {
    const amountToRecord = getAmountToRecord();
    if (typeof amountToRecord !== "number") return;
    setVerifying(true);
    try {
      const verification = await verifyPayment({
          transactionReference,
          provider: selectedPaymentProvider,
          courseId: course.id,
          expectedAmount: amountToRecord,
          currency: selectedCurrency,
          studentData: {
            fullName,
            email: user?.email ?? email,
            phone,
            education,
            heardFrom: heard,
            country: selectedCountry?.name ?? country,
            language: selectedCountry?.language ?? lang,
            preferredLanguage,
            preferredTime,
            clusterCode: selectedCluster.code,
            paymentOption: payOption,
            languageCode: preferredLanguage,
          },
      });
      if (!verification.success) {
        toast.error("Payment could not be verified. Please try again.");
        return;
      }
      if (!verification.cohortId) {
        await enroll({
          courseId: course.id,
          studentEmail: user?.email ?? email,
          fullName,
          phone,
          education,
          heardFrom: heard,
          paymentOption: payOption,
          paymentAmount: amountToRecord,
          paymentCurrency: selectedCurrency,
          paymentStatus: "paid",
          country: selectedCountry?.name ?? country,
          language: selectedCountry?.language ?? lang,
          preferredLanguage,
          preferredTime,
          clusterCode: selectedCluster.code,
          languageCode: preferredLanguage,
          paymentProvider: selectedPaymentProvider,
        });
      }
      toast.success(`Enrollment paid via ${providerLabel(selectedPaymentProvider)}`);
      navigate({ to: "/dashboard" });
    } finally {
      setVerifying(false);
    }
  };

  const openCheckout = async (init: PaymentInitializationResult) => {
    if (init.mock) {
      await finalizeEnrollment(init.reference);
      return;
    }

    if (init.provider === "paystack") {
      const loaded = await loadCheckoutScript("paystack-inline-js", "https://js.paystack.co/v2/inline.js");
      const paystack = (window as unknown as { PaystackPop?: { setup?: (config: Record<string, unknown>) => { openIframe: () => void }; resumeTransaction?: (accessCode: string) => void } }).PaystackPop;
      if (!loaded || !paystack) return finalizeEnrollment(init.reference);
      if (init.accessCode && paystack.resumeTransaction) {
        paystack.resumeTransaction(init.accessCode);
        return;
      }
      paystack.setup?.({
        key: init.publicKey,
        email: user?.email ?? email,
        amount: Math.round(init.amount * 100),
        currency: init.currency,
        ref: init.reference,
        onSuccess: () => finalizeEnrollment(init.reference),
        onCancel: () => toast.info("Payment window closed."),
      })?.openIframe();
      return;
    }

    if (init.provider === "seerbit") {
      const loaded = await loadCheckoutScript("seerbit-inline-js", "https://checkout.seerbitapi.com/api/v2/seerbit.js");
      const seerbit = (window as unknown as { SeerbitPay?: (config: Record<string, unknown>, callback: () => void) => void }).SeerbitPay;
      if (!loaded || !seerbit) return finalizeEnrollment(init.reference);
      seerbit({
        public_key: init.publicKey,
        tranref: init.tranref ?? init.reference,
        amount: init.amount,
        currency: init.currency,
        email: user?.email ?? email,
        full_name: fullName,
      }, () => finalizeEnrollment(init.tranref ?? init.reference));
      return;
    }

    const loaded = await loadCheckoutScript("flutterwave-inline-js", "https://checkout.flutterwave.com/v3.js");
    const flutterwave = (window as unknown as { FlutterwaveCheckout?: (config: Record<string, unknown>) => void }).FlutterwaveCheckout;
    if (!loaded || !flutterwave) return finalizeEnrollment(init.reference);
    flutterwave({
      public_key: init.publicKey,
      tx_ref: init.reference,
      amount: init.amount,
      currency: init.currency,
      customer: { email: user?.email ?? email, phone_number: phone, name: fullName },
      customizations: { title: "Serencog Enrollment", description: course.title.en },
      callback: (response: { transaction_id?: string; tx_ref?: string }) => finalizeEnrollment(String(response.transaction_id ?? response.tx_ref ?? init.reference)),
      onclose: () => toast.info("Payment window closed."),
    });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Sign in above to continue");
    const cleanName = fullName.trim();
    const cleanEmail = (user.email || email).trim().toLowerCase();
    const cleanPhone = phone.trim();
    if (cleanName.length < 2 || cleanName.length > 100) return toast.error("Enter your full name (2–100 characters)");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) return toast.error("Enter a valid email address");
    if (!/^\+?[0-9\s-]{7,20}$/.test(cleanPhone)) return toast.error("Enter a valid phone number (7–20 digits)");
    if (!selectedCountry) return toast.error("Select your country so we can route your payment");
    if (!preferredLanguage) return toast.error("Select the language you want to learn in");
    const amountToRecord = getAmountToRecord();
    if (typeof amountToRecord !== "number") return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          studentData: {
            fullName: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            education,
            heardFrom: heard,
            country: selectedCountry?.name ?? country,
            language: selectedCountry?.language ?? lang,
            preferredLanguage,
            preferredTime,
            clusterCode: selectedCluster.code,
            paymentOption: payOption,
            languageCode: preferredLanguage,
          },
          courseId: course.id,
          courseTitle: course.title.en,
          countryCode: selectedCountry?.code ?? country,
          language_code: preferredLanguage,
          cluster_code: selectedCluster.code,
          amount: amountToRecord,
          currency: selectedCurrency,
          paymentOption: payOption,
        }),
      });
      if (!response.ok) throw new Error("Payment initialization failed");
      const init = (await response.json()) as PaymentInitializationResult;
      await openCheckout(init);
    } catch {
      toast.error("Unable to start payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 space-y-6">
        {!user && (
          <Card className="p-6">
            <h2 className="text-xl font-bold">Sign In or Create Account</h2>
            <p className="mt-1 text-sm text-muted-foreground">You need to be signed in to enroll. This enrollment will remain saved below.</p>
            <Tabs defaultValue="signin" className="mt-4">
              <TabsList>
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Create Account</TabsTrigger>
              </TabsList>
              <TabsContent value="signin" className="mt-4">
                <form onSubmit={handleSignIn} className="grid gap-3">
                  <div><Label>Email</Label><Input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required /></div>
                  <div><Label>Password</Label><Input type="password" value={authPass} onChange={(e) => setAuthPass(e.target.value)} required /></div>
                  <Button type="submit">Sign In</Button>
                </form>
              </TabsContent>
              <TabsContent value="signup" className="mt-4">
                <form onSubmit={handleSignUp} className="grid gap-3">
                  <div><Label>Full Name</Label><Input value={authName} onChange={(e) => setAuthName(e.target.value)} required /></div>
                  <div><Label>Email</Label><Input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required /></div>
                  <div><Label>Password</Label><Input type="password" value={authPass} onChange={(e) => setAuthPass(e.target.value)} required /></div>
                  <Button type="submit">Create Account</Button>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-xl font-bold">Enrollment Details for {course.title.en} · Cohort {nextCohortNumber}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {course.durationWeeks} weeks · cohorts of {course.cohortSize}. Complete the form below and we will route your payment automatically based on your selected country.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-6">
            <fieldset className="grid gap-3">
              <legend className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Personal Information</legend>
              <div><Label>Full Name *</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
              <div><Label>Email *</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <div><Label>Phone Number *</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
            </fieldset>

            <fieldset className="grid gap-3">
              <legend className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Education &amp; Experience</legend>
              <div>
                <Label>Country</Label>
                <Select value={country || detectedCountry} onValueChange={setCountry}>
                  <SelectTrigger><SelectValue placeholder="Select your country" /></SelectTrigger>
                  <SelectContent>
                    {COUNTRY_OPTIONS.map((option) => (
                      <SelectItem key={option.code} value={option.name}>{option.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="min-h-[84px] rounded-lg border p-3 text-sm">
                <div className="font-medium">Regional Cluster</div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">{selectedCluster.code}</span>
                  <span className="text-muted-foreground">{clusterLabel(selectedCluster.code)} · {clusterTimezone(selectedCluster.code)}</span>
                </div>
              </div>
              <div>
                <Label>Class Language *</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  You will be grouped with learners in your region who chose the same language.
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    { value: "en" as const, label: "🇬🇧 English" },
                    { value: "fr" as const, label: "🇫🇷 Français" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      aria-pressed={preferredLanguage === option.value}
                      variant={preferredLanguage === option.value ? "default" : "outline"}
                      onClick={() => { setPreferredLanguage(option.value); setLanguageChosen(true); }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                <p className="mt-2 text-xs font-semibold text-primary">
                  Cohort key: {course.title.en} · [{selectedCluster.code} - {preferredLanguage.toUpperCase()}]
                </p>
              </div>
              <div>
                <Label>Preferred Live Class Time</Label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {PREFERRED_TIME_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={preferredTime === option.value ? "default" : "outline"}
                      onClick={() => setPreferredTime(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Education Level</Label>
                <Select value={education} onValueChange={setEducation}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["High School","Diploma","Bachelor's Degree","Master's Degree","PhD","Other"].map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>How did you hear about us?</Label>
                <Select value={heard} onValueChange={setHeard}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Social Media","Friend/Referral","Google Search","Our Website","Other"].map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </fieldset>

            <fieldset className="grid gap-3">
              <legend className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Payment Information</legend>
              <div className="grid gap-2 rounded-lg border p-3 text-sm">
                <div className="font-medium">Country: <span className="text-muted-foreground">{selectedCountry?.name || "—"}</span></div>
                <div className="font-medium">Language: <span className="text-muted-foreground">{selectedLanguage === "fr" ? "French" : "English"}</span></div>
                <div className="font-medium">Cohort Cluster: <span className="text-muted-foreground">{selectedCluster.code} · {clusterLabel(selectedCluster.code)}</span></div>
                <div className="font-medium">Preferred Schedule: <span className="text-muted-foreground">{preferredTime} · {preferredLanguage === "fr" ? "French" : "English"}</span></div>
                <div className="font-medium">Payment Gateway: <span className="text-muted-foreground">{paymentRoute.providerName} ({selectedCurrency} {Math.round(payOption === "full" ? fullAmount : Number(partialAmount || 0)).toLocaleString()})</span></div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-black text-primary-foreground">
                  {paymentRoute.logoText}
                </div>
                <div>
                  <div className="font-medium text-foreground">Paying securely via {paymentRoute.providerName} [Test Mode]</div>
                  <div className="text-muted-foreground">Sandbox and local mock fallbacks are enabled until production gateway keys are ready.</div>
                </div>
              </div>
              <label className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer">
                <input type="radio" checked={payOption === "full"} onChange={() => setPayOption("full")} />
                <span>Pay Full Amount: <strong>{formatPrice(course.basePriceUSD, selectedCurrency)}</strong></span>
              </label>
              <div className="rounded-lg border p-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" checked={payOption === "partial"} onChange={() => setPayOption("partial")} />
                  <span>Pay Partial Amount</span>
                </label>
                {payOption === "partial" && (
                  <div className="mt-3 grid gap-2">
                    <Label htmlFor="partial-amount">Enter amount in {selectedCurrency}</Label>
                    <Input
                      id="partial-amount"
                      type="number"
                      min={Math.floor(minimumPartialAmount) + 1}
                      max={Math.floor(fullAmount)}
                      step="1"
                      value={partialAmount}
                      onChange={(event) => setPartialAmount(event.target.value)}
                      placeholder={`More than ${formatPrice(10, selectedCurrency)}`}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum accepted partial payment is more than {formatPrice(10, selectedCurrency)}.
                    </p>
                  </div>
                )}
              </div>
            </fieldset>

            <Button type="submit" size="lg" className="w-full" disabled={!user || submitting}>
              {submitting ? "Starting payment..." : "Proceed to Payment"}
            </Button>
            {!user && <p className="text-center text-xs text-muted-foreground">Sign in above to continue to payment.</p>}
          </form>
        </Card>

        {verifying && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-background/90 px-4">
            <Card className="w-full max-w-sm p-6 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <h3 className="mt-4 text-lg font-bold">Verifying payment</h3>
              <p className="mt-2 text-sm text-muted-foreground">Verifying payment and finalizing your enrollment...</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
