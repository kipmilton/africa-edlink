import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useApp } from "@/lib/app-context";
import { useAuth, signInMock } from "@/lib/use-auth";
import { formatPrice } from "@/lib/currency";
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
  const { courses, currency, enroll, cohorts } = useApp();
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
  const [payOption, setPayOption] = useState<"full" | "partial">("full");
  const [showPaid, setShowPaid] = useState(false);

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

  const handleSignIn = (e: FormEvent) => {
    e.preventDefault();
    if (!authEmail) return toast.error("Enter your email");
    signInMock(authEmail, authName || undefined);
    setEmail(authEmail);
    setFullName(authName || authEmail.split("@")[0]);
    void authPass;
    toast.success("Signed in");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Sign in above to continue");
    enroll({
      courseId: course.id,
      studentEmail: email,
      fullName,
      phone,
      education,
      heardFrom: heard,
      paymentOption: payOption,
    });
    setShowPaid(true);
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
                  <div><Label>Password</Label><Input type="password" value={authPass} onChange={(e) => setAuthPass(e.target.value)} placeholder="anything (demo)" /></div>
                  <Button type="submit">Sign In</Button>
                </form>
              </TabsContent>
              <TabsContent value="signup" className="mt-4">
                <form onSubmit={handleSignIn} className="grid gap-3">
                  <div><Label>Full Name</Label><Input value={authName} onChange={(e) => setAuthName(e.target.value)} required /></div>
                  <div><Label>Email</Label><Input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required /></div>
                  <div><Label>Password</Label><Input type="password" value={authPass} onChange={(e) => setAuthPass(e.target.value)} placeholder="anything (demo)" /></div>
                  <Button type="submit">Create Account</Button>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-xl font-bold">Enrollment Details for {course.title.en} · Cohort {nextCohortNumber}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Complete the form below to proceed to payment.</p>

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
              <label className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer">
                <input type="radio" checked={payOption === "full"} onChange={() => setPayOption("full")} />
                <span>Pay Full Amount: <strong>{formatPrice(course.basePriceUSD, currency)}</strong></span>
              </label>
              <label className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer">
                <input type="radio" checked={payOption === "partial"} onChange={() => setPayOption("partial")} />
                <span>Pay Partial Amount: <strong>{formatPrice(course.basePriceUSD / 2, currency)}</strong> (50%)</span>
              </label>
            </fieldset>

            <Button type="submit" size="lg" className="w-full" disabled={!user}>Proceed to Payment</Button>
            {!user && <p className="text-center text-xs text-muted-foreground">Sign in above to enable payment.</p>}
          </form>
        </Card>

        <Dialog open={showPaid} onOpenChange={setShowPaid}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Payment Gateway Integration Coming Soon!</DialogTitle>
              <DialogDescription>Your enrollment details have been saved successfully.</DialogDescription>
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