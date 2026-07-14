import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useApp } from "@/lib/app-context";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { COUNTRY_OPTIONS, convertUSDToCurrency, formatPrice, type PaymentProvider } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/enroll/$id")({
  head: () => ({ meta: [{ title: "Enroll — Serenog" }] }),
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
  const [payOption, setPayOption] = useState<"full" | "partial">("full");
  const [partialAmount, setPartialAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPaid, setShowPaid] = useState(false);
  const selectedCountry = useMemo(() => COUNTRY_OPTIONS.find((item) => item.name === country || item.code === country), [country]);
  const selectedLanguage = selectedCountry?.language ?? lang;
  const selectedCurrency = selectedCountry?.currency ?? currency;
  const selectedPaymentProvider = (selectedCountry?.paymentProvider ?? "flutterwave") as PaymentProvider;
  const minimumPartialAmount = convertUSDToCurrency(10, selectedCurrency);
  const fullAmount = convertUSDToCurrency(course?.basePriceUSD ?? 0, selectedCurrency);

  useEffect(() => {
    if (selectedCountry && selectedLanguage !== lang) {
      setLang(selectedLanguage, { persist: false });
    }
  }, [selectedCountry, selectedLanguage, lang, setLang]);

  if (!course) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Course not found</h1>
        <Button asChild className="mt-4"><Link to="/courses">Back to courses</Link></Button>
      </div>
    );
  }

  const nextCohortNumber = (() => {
    const active = cohorts.filter((c) => c.courseId === course.id && !c.completed);
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

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Sign in above to continue");
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

    setSubmitting(true);
    try {
      await enroll({
      courseId: course.id,
      studentEmail: user.email,
      fullName,
      phone,
      education,
      heardFrom: heard,
      paymentOption: payOption,
      paymentAmount: amountToRecord,
      paymentCurrency: selectedCurrency,
      paymentStatus: "skipped",
      country: selectedCountry?.name ?? country,
      language: selectedCountry?.language ?? lang,
      paymentProvider: selectedCountry?.paymentProvider ?? selectedPaymentProvider,
      });
      setShowPaid(true);
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
          <p className="mt-1 text-sm text-muted-foreground">Complete the form below. Payment gateway setup is currently skipped, so your enrollment will be submitted directly.</p>

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
                <div className="font-medium">Payment Method: <span className="text-muted-foreground">{selectedPaymentProvider === "paystack" ? "Paystack" : selectedPaymentProvider === "flutterwave" ? "Flutterwave" : "CinetPay"}</span></div>
              </div>
              <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                <div className="font-medium text-foreground">Selected payment summary</div>
                <div className="mt-1">Gateway collection is temporarily skipped. Your enrollment will still be submitted for admin review and tutor assignment.</div>
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
              {submitting ? "Submitting..." : "Submit Enrollment"}
            </Button>
            {!user && <p className="text-center text-xs text-muted-foreground">Sign in above to submit enrollment.</p>}
          </form>
        </Card>

        <Dialog open={showPaid} onOpenChange={setShowPaid}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enrollment Submitted</DialogTitle>
              <DialogDescription>Your enrollment has been saved. You can now continue to your student dashboard.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPaid(false)}>Close</Button>
              <Button onClick={() => navigate({ to: "/dashboard" })}>Go to dashboard</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
