import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useApp, type LocalCourse, type Role, type Cohort } from "@/lib/app-context";
import { useAuth } from "@/lib/use-auth";
import { formatPrice } from "@/lib/currency";
import { providerLabel } from "@/lib/payment-router";
import { REGIONAL_CLUSTERS, clusterLabel, clusterTimezone } from "@/lib/regional-clusters";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Users, GraduationCap, MessageSquare, BookOpen, Wallet, Plus, Award, Send, Upload, Share2, AlertTriangle, CheckCircle2, Video, XCircle, UserCheck,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Serencog Technologies" }] }),
  component: DashboardPage,
});

function initials(name: string) {
  return name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
}
function InitialAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <Avatar className={className}>
      <AvatarFallback className="bg-primary text-primary-foreground font-bold">{initials(name || "?")}</AvatarFallback>
    </Avatar>
  );
}

function DashboardPage() {
  const { user, role: authRole, loading } = useAuth();
  const { role, setRole, tutorApplications } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (authRole) setRole(authRole as Role);
  }, [authRole, setRole]);

  if (loading || !user) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-muted-foreground">Loading your dashboard…</div>;
  }

  const canSwitch = authRole === "admin";
  const displayName = user.fullName || user.email.split("@")[0];

  const myPending = tutorApplications.find(
    (a) => a.email.toLowerCase() === user.email.toLowerCase() && a.status === "pending",
  );
  const showPending = authRole !== "admin" && authRole !== "tutor" && !!myPending;

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-accent/80">Dashboard</p>
            <h1 className="truncate text-2xl font-heading font-extrabold sm:text-3xl">Welcome back, {displayName}</h1>
            <p className="text-xs text-muted-foreground">Signed in as {user.email}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {canSwitch ? (
              <>
                <span className="hidden text-xs text-muted-foreground sm:inline">View as</span>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger className="w-40 rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="tutor">Tutor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </>
            ) : (
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {authRole}
              </Badge>
            )}
            <InitialAvatar name={displayName} className="h-9 w-9" />
          </div>
        </div>

        <div className="mt-8">
          {showPending ? (
            <Card className="p-10 text-center">
              <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
              <h2 className="mt-4 text-xl font-bold">Your tutor application is under review</h2>
              <p className="mt-2 max-w-lg mx-auto text-sm text-muted-foreground">
                Thanks for applying, {displayName}. Our team is reviewing your application submitted on{" "}
                {new Date(myPending!.createdAt).toLocaleDateString()}. We'll email you when a decision is made — usually within 48 hours.
              </p>
            </Card>
          ) : (
            <>
              {role === "student" && <StudentDash />}
              {role === "tutor" && <TutorDash />}
              {role === "admin" && <AdminDash />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================== STUDENT ================== */
function StudentDash() {
  const { user } = useAuth();
  const { enrollments, cohorts, courses, chats, sendChat, certificates } = useApp();
  const myEnrollments = useMemo(
    () =>
      enrollments.filter(
        (e) =>
          (e.studentEmail ?? "").toLowerCase() ===
          (user?.email ?? "").toLowerCase(),
      ),
    [enrollments, user?.email],
  );
  const myCohortIds = new Set(myEnrollments.map((e) => e.cohortId));
  const myCohorts = cohorts.filter((c) => myCohortIds.has(c.id));
  const myCerts = certificates.filter(
    (c) =>
      (c.studentEmail ?? "").toLowerCase() ===
      (user?.email ?? "").toLowerCase(),
  );

  return (
    <Tabs defaultValue="overview">
      <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-card p-1 sm:w-auto">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="chat">Ask &amp; Answer</TabsTrigger>
        <TabsTrigger value="certs">Certificates</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {myEnrollments.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground md:col-span-2 lg:col-span-3">
            You are not enrolled in any course yet. Head to <a href="/courses" className="text-primary font-semibold">Courses</a> to enroll.
          </Card>
        )}
        {myEnrollments.map((e) => {
          const course = courses.find((c) => c.id === e.courseId);
          const cohort = cohorts.find((c) => c.id === e.cohortId);
          if (!course || !cohort) return null;
          return (
            <Card key={e.id} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold">{course.title.en}</h3>
                  <p className="text-xs text-muted-foreground">Cohort {cohort.number} [{cohort.clusterCode ?? e.clusterCode ?? "EAST_ANG"}]</p>
                </div>
                <Badge variant={cohort.completed ? "secondary" : "default"} className="rounded-full">
                  {cohort.completed ? "Completed" : "In progress"}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{course.desc.en}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Badge variant="outline">{clusterLabel(cohort.clusterCode ?? e.clusterCode)}</Badge>
                <Badge variant="secondary">{clusterTimezone(cohort.clusterCode ?? e.clusterCode)}</Badge>
                {e.preferredTime && <Badge variant="outline">{e.preferredTime}</Badge>}
                <Badge variant="outline">{(e.preferredLanguage ?? e.language) === "fr" ? "French" : "English"}</Badge>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">Classmates: {cohort.studentIds.length}/{course.cohortSize}</div>
            </Card>
          );
        })}
      </TabsContent>

      <TabsContent value="chat" className="mt-6">
        {myCohorts.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">Enroll in a course to unlock the Ask &amp; Answer workspace.</Card>
        ) : (
          <AskAnswer cohorts={myCohorts} chats={chats} onSend={sendChat} authorRole="student" />
        )}
      </TabsContent>

      <TabsContent value="certs" className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {myCerts.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground md:col-span-2 lg:col-span-3">
            No certificates yet. Complete a cohort to earn one.
          </Card>
        )}
        {myCerts.map((cert) => {
          const verifyUrl = `${window.location.origin}/verify/${cert.id}`;
          const linkedInHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`;
          return (
            <Card key={cert.id} className="p-5">
              <Award className="h-8 w-8 text-primary" />
              <h3 className="mt-3 font-bold">{cert.courseName}</h3>
              <p className="text-xs text-muted-foreground">Cohort {cert.cohortNumber} · issued {new Date(cert.issuedAt).toLocaleDateString()}</p>
              {cert.fileDataUrl && <img src={cert.fileDataUrl} alt="Certificate" className="mt-3 aspect-video w-full rounded border object-cover" />}
              <div className="mt-4 flex gap-2">
                <Button asChild size="sm" className="flex-1"><a href={linkedInHref} target="_blank" rel="noreferrer"><Share2 className="mr-2 h-4 w-4" /> Share on LinkedIn</a></Button>
                <Button asChild size="sm" variant="outline"><a href={verifyUrl} target="_blank" rel="noreferrer">Verify</a></Button>
              </div>
            </Card>
          );
        })}
      </TabsContent>
    </Tabs>
  );
}

/* ================== TUTOR ================== */
function TutorDash() {
  const { user } = useAuth();
  const { cohorts, courses, enrollments, chats, sendChat, markCohortComplete, submitForCertification } = useApp();
  const myCohorts = useMemo(
    () => cohorts.filter((c) => (c.tutorEmail ?? "").toLowerCase() === (user?.email ?? "").toLowerCase()),
    [cohorts, user?.email],
  );

  const [confirmCohort, setConfirmCohort] = useState<Cohort | null>(null);
  const [certifyCohort, setCertifyCohort] = useState<Cohort | null>(null);

  return (
    <Tabs defaultValue="cohorts">
      <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-card p-1 sm:w-auto">
        <TabsTrigger value="cohorts">My Cohorts</TabsTrigger>
        <TabsTrigger value="chat">Ask &amp; Answer</TabsTrigger>
        <TabsTrigger value="recordings">Class Recordings</TabsTrigger>
      </TabsList>

      <TabsContent value="cohorts" className="mt-6 grid gap-4 md:grid-cols-2">
        {myCohorts.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground md:col-span-2">
            No cohorts assigned yet. The admin will assign a cohort to you once it fills up.
          </Card>
        )}
        {myCohorts.map((cohort) => {
          const course = courses.find((c) => c.id === cohort.courseId);
          const students = enrollments.filter((e) => cohort.studentIds.includes(e.id));
          return (
            <Card key={cohort.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold">{course?.title.en ?? "Course"}</h3>
                  <p className="text-xs text-muted-foreground">Cohort {cohort.number} [{clusterLabel(cohort.clusterCode)}] · {students.length} students</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={cohort.completed ? "secondary" : "default"} className="rounded-full">
                    {cohort.completed ? "Completed" : "Active"}
                  </Badge>
                  <Badge variant="outline">{cohort.clusterCode ?? "EAST_ANG"}</Badge>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{clusterTimezone(cohort.clusterCode)} · {(students[0]?.preferredLanguage ?? students[0]?.language) === "fr" ? "French" : "English"}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {students.map((s) => (
                  <li key={s.id} className="flex items-center gap-2">
                    <InitialAvatar name={s.fullName} className="h-6 w-6" />
                    <span>{s.fullName}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{s.studentEmail}</span>
                  </li>
                ))}
              </ul>
              {!cohort.completed && (
                <Button className="mt-4 w-full" variant="outline" onClick={() => setConfirmCohort(cohort)}>
                  Mark course as complete
                </Button>
              )}
            </Card>
          );
        })}

        {/* Confirm complete */}
        <Dialog open={!!confirmCohort} onOpenChange={(o) => !o && setConfirmCohort(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" /> Confirm completion</DialogTitle>
              <DialogDescription>
                Warning: Marking this course as complete will end this course cohort. This action cannot be undone. Are you sure you want to proceed?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmCohort(null)}>Cancel</Button>
              <Button onClick={() => { const c = confirmCohort!; setConfirmCohort(null); setCertifyCohort(c); }}>Proceed to Certify</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Certify checklist */}
        <CertifyDialog
          cohort={certifyCohort}
          onClose={() => setCertifyCohort(null)}
          onSubmit={(entries, cohortId) => {
            submitForCertification(entries);
            markCohortComplete(cohortId);
            setCertifyCohort(null);
            toast.success("Submitted for admin approval");
          }}
        />
      </TabsContent>

      <TabsContent value="chat" className="mt-6">
        {myCohorts.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">No cohorts to chat with yet.</Card>
        ) : (
          <AskAnswer cohorts={myCohorts} chats={chats} onSend={sendChat} authorRole="tutor" />
        )}
      </TabsContent>

      <TabsContent value="recordings" className="mt-6">
        <TutorRecordings cohorts={myCohorts} />
      </TabsContent>
    </Tabs>
  );
}

function CertifyDialog({
  cohort, onClose, onSubmit,
}: {
  cohort: Cohort | null;
  onClose: () => void;
  onSubmit: (entries: { cohortId: string; courseId: string; studentEnrollmentId: string; studentName: string; submittedByEmail: string }[], cohortId: string) => void;
}) {
  const { user } = useAuth();
  const { enrollments } = useApp();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  useEffect(() => { setSelected(new Set()); }, [cohort?.id]);
  if (!cohort) return null;
  const students = enrollments.filter((e) => cohort.studentIds.includes(e.id));
  const toggle = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Certify graduates</DialogTitle>
          <DialogDescription>Select students who meet the graduation requirements.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {students.map((s) => (
            <label key={s.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/40 cursor-pointer">
              <Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggle(s.id)} />
              <InitialAvatar name={s.fullName} className="h-8 w-8" />
              <div className="min-w-0">
                <p className="text-sm font-medium">{s.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">{s.studentEmail}</p>
              </div>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={selected.size === 0}
            onClick={() => onSubmit(
              students.filter((s) => selected.has(s.id)).map((s) => ({
                cohortId: cohort.id,
                courseId: cohort.courseId,
                studentEnrollmentId: s.id,
                studentName: s.fullName,
                submittedByEmail: user?.email ?? "",
              })),
              cohort.id,
            )}
          >
            Submit for Approval
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ================== ASK & ANSWER ================== */
function AskAnswer({
  cohorts, chats, onSend, authorRole,
}: {
  cohorts: Cohort[];
  chats: ReturnType<typeof useApp>["chats"];
  onSend: ReturnType<typeof useApp>["sendChat"];
  authorRole: "student" | "tutor";
}) {
  const { user } = useAuth();
  const { courses } = useApp();
  const [activeId, setActiveId] = useState(cohorts[0]?.id ?? "");
  useEffect(() => { if (!cohorts.find((c) => c.id === activeId)) setActiveId(cohorts[0]?.id ?? ""); }, [cohorts, activeId]);
  const [text, setText] = useState("");
  const activeCohort = cohorts.find((c) => c.id === activeId);
  const cohortChats = chats.filter((m) => m.cohortId === activeId);
  const activeCourse = courses.find((c) => c.id === activeCohort?.courseId);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeCohort || !user) return;
    onSend({
      cohortId: activeCohort.id,
      authorEmail: user.email,
      authorName: user.fullName,
      authorRole,
      text: text.trim(),
    });
    setText("");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <Card className="p-3">
        <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Cohorts</p>
        <div className="space-y-1">
          {cohorts.map((c) => {
            const course = courses.find((x) => x.id === c.courseId);
            return (
              <button key={c.id} onClick={() => setActiveId(c.id)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm ${activeId === c.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                <div className="font-medium truncate">{course?.title.en ?? "Course"}</div>
                <div className="text-xs opacity-70">Cohort {c.number}</div>
              </button>
            );
          })}
        </div>
      </Card>
      <Card className="flex flex-col p-0" style={{ minHeight: 480 }}>
        <div className="border-b p-4">
          <p className="text-sm font-bold">{activeCourse?.title.en ?? "Cohort"} · Cohort {activeCohort?.number}</p>
          <p className="text-xs text-muted-foreground">Ask &amp; Answer workspace — {authorRole === "tutor" ? "chat with your students" : "chat with classmates and your tutor"}.</p>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {cohortChats.length === 0 && <p className="text-center text-sm text-muted-foreground">No messages yet. Start the conversation.</p>}
          {cohortChats.map((m) => {
            const mine = m.authorEmail.toLowerCase() === (user?.email ?? "").toLowerCase();
            return (
              <div key={m.id} className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                <InitialAvatar name={m.authorName} className="h-7 w-7 shrink-0" />
                <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <div className="text-xs opacity-70">
                    {m.authorName} · {m.authorRole}
                  </div>
                  <div>{m.text}</div>
                </div>
              </div>
            );
          })}
        </div>
        <form onSubmit={submit} className="flex gap-2 border-t p-3">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" />
          <Button type="submit" size="icon"><Send className="h-4 w-4" /></Button>
        </form>
      </Card>
    </div>
  );
}

/* ================== ADMIN ================== */
function AdminDash() {
  const { courses, enrollments, cohorts, certificates } = useApp();
  return (
    <Tabs defaultValue="overview">
      <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-card p-1 sm:w-auto">
        <TabsTrigger value="overview">Global Overview</TabsTrigger>
        <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
        <TabsTrigger value="courses">Courses</TabsTrigger>
        <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
        <TabsTrigger value="tutors">Tutor Applications</TabsTrigger>
        <TabsTrigger value="graduate">Graduate School</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { l: "Students", v: enrollments.length, i: GraduationCap },
          { l: "Courses", v: courses.length, i: BookOpen },
          { l: "Cohorts", v: cohorts.length, i: Users },
          { l: "Certificates", v: certificates.length, i: Award },
          { l: "Discussions", v: 0, i: MessageSquare },
        ].map((k) => {
          const I = k.i;
          return (
            <Card key={k.l} className="p-5">
              <div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">{k.l}</p><I className="h-4 w-4 text-primary" /></div>
              <p className="mt-2 text-3xl font-black">{k.v}</p>
            </Card>
          );
        })}
      </TabsContent>

      <TabsContent value="enrollments" className="mt-6"><AdminEnrollmentsPanel /></TabsContent>
      <TabsContent value="courses" className="mt-6"><AdminCoursesPanel /></TabsContent>
      <TabsContent value="cohorts" className="mt-6"><AdminCohortsPanel /></TabsContent>
      <TabsContent value="tutors" className="mt-6"><AdminTutorApplicationsPanel /></TabsContent>
      <TabsContent value="graduate" className="mt-6"><AdminGraduatePanel /></TabsContent>
    </Tabs>
  );
}

function AdminEnrollmentsPanel() {
  const { enrollments, courses, cohorts } = useApp();
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Active Student Enrollments</h3>
          <p className="text-sm text-muted-foreground">Track each learner's cohort, payment gateway and paid enrollment status.</p>
        </div>
      </div>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Cohort</TableHead>
              <TableHead>Cluster</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Preferred Time</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Provider</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.map((entry) => {
              const course = courses.find((c) => c.id === entry.courseId);
              const cohort = cohorts.find((c) => c.id === entry.cohortId);
              const paymentProviderLabel = entry.paymentProvider ? providerLabel(entry.paymentProvider) : "—";
              return (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="font-medium">{entry.fullName}</div>
                    <div className="text-xs text-muted-foreground">{entry.studentEmail}</div>
                  </TableCell>
                  <TableCell>{course?.title.en ?? "Course"}</TableCell>
                  <TableCell>{cohort ? <Badge variant="outline">Cohort {cohort.number}</Badge> : "—"}</TableCell>
                  <TableCell><Badge variant="secondary">{entry.clusterCode ?? cohort?.clusterCode ?? "EAST_ANG"}</Badge></TableCell>
                  <TableCell>{entry.country || "—"}</TableCell>
                  <TableCell>{(entry.preferredLanguage ?? entry.language) === "fr" ? "French" : (entry.preferredLanguage ?? entry.language) === "en" ? "English" : "—"}</TableCell>
                  <TableCell>{entry.preferredTime ?? "—"}</TableCell>
                  <TableCell>{entry.paymentAmount && entry.paymentCurrency ? `${entry.paymentCurrency} ${entry.paymentAmount.toLocaleString()}` : "n/a"}</TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{entry.paymentStatus ?? "skipped"}</Badge></TableCell>
                  <TableCell>{entry.paymentStatus === "paid" ? `Paid via ${paymentProviderLabel}` : paymentProviderLabel}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function AdminCoursesPanel() {
  const { courses, addCourse, updateCourse, currency, enrollments } = useApp();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LocalCourse | null>(null);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Course Management</h3>
          <p className="text-sm text-muted-foreground">Add, edit and organize your catalog. Prices display in {currency} on the storefront.</p>
        </div>
        <Dialog open={open || !!editing} onOpenChange={(o) => { if (!o) { setOpen(false); setEditing(null); } }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="mr-2 h-4 w-4" />Add Course</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit course" : "Add new course"}</DialogTitle></DialogHeader>
            <CourseForm
              initial={editing}
              onSubmit={(c) => {
                if (editing) updateCourse(editing.id, c); else addCourse({ ...c, id: "" } as LocalCourse);
                setOpen(false); setEditing(null);
                toast.success(editing ? "Course updated" : "Course added");
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <Card key={c.id} className="overflow-hidden p-0">
            {c.image ? <img src={c.image} alt="" className="h-32 w-full object-cover" /> : <div className="h-32 bg-muted" />}
            <div className="p-4">
              <h4 className="font-bold">{c.title.en}</h4>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.desc.en}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <Badge variant="secondary">{formatPrice(c.basePriceUSD, currency)}</Badge>
                <Badge variant="outline">Cohort size: {c.cohortSize}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-1 text-xs">
                {REGIONAL_CLUSTERS.map((cluster) => (
                  <Badge key={cluster.code} variant="outline" className="justify-center">
                    {cluster.code}: {enrollments.filter((entry) => entry.courseId === c.id && entry.clusterCode === cluster.code).length}
                  </Badge>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditing(c)}>Edit</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CourseForm({
  initial, onSubmit,
}: {
  initial: LocalCourse | null;
  onSubmit: (c: Partial<LocalCourse>) => void;
}) {
  const [name, setName] = useState(initial?.title.en ?? "");
  const [nameFr, setNameFr] = useState(initial?.title.fr ?? "");
  const [shortDesc, setShortDesc] = useState(initial?.desc.en ?? "");
  const [shortDescFr, setShortDescFr] = useState(initial?.desc.fr ?? "");
  const [full, setFull] = useState(initial?.what.en ?? "");
  const [fullFr, setFullFr] = useState(initial?.what.fr ?? "");
  const [whatsnew, setWhatsnew] = useState(initial?.whatsnew.en ?? "");
  const [whatsnewFr, setWhatsnewFr] = useState(initial?.whatsnew.fr ?? "");
  const [audience, setAudience] = useState(initial?.for.en ?? "");
  const [audienceFr, setAudienceFr] = useState(initial?.for.fr ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [price, setPrice] = useState<number>(initial?.basePriceUSD ?? 800);
  const [cohortSize, setCohortSize] = useState<number>(initial?.cohortSize ?? 8);
  const [mode, setMode] = useState<"online" | "physical" | "hybrid">(initial?.delivery ?? "online");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: { en: name, fr: nameFr || name },
      desc: { en: shortDesc, fr: shortDescFr || shortDesc },
      what: { en: full, fr: fullFr || full },
      whatsnew: { en: whatsnew, fr: whatsnewFr || whatsnew },
      for: { en: audience, fr: audienceFr || audience },
      image,
      delivery: mode,
      basePriceUSD: Number(price),
      cohortSize: Math.min(10, Math.max(5, Number(cohortSize))),
    });
  };

  return (
    <form onSubmit={submit} className="grid gap-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <div><Label>Course name (English)</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div><Label>Course name (French)</Label><Input value={nameFr} onChange={(e) => setNameFr(e.target.value)} /></div>
      </div>
      <div><Label>Image URL</Label><Input type="url" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." /></div>
      {image ? <img src={image} alt="" className="h-32 w-full rounded-md border object-cover" /> : null}
      <div className="grid gap-2 sm:grid-cols-2">
        <div><Label>Short description (English)</Label><Textarea value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} rows={2} /></div>
        <div><Label>Short description (French)</Label><Textarea value={shortDescFr} onChange={(e) => setShortDescFr(e.target.value)} rows={2} /></div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div><Label>Full description (English)</Label><Textarea value={full} onChange={(e) => setFull(e.target.value)} rows={4} /></div>
        <div><Label>Full description (French)</Label><Textarea value={fullFr} onChange={(e) => setFullFr(e.target.value)} rows={4} /></div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div><Label>What's new (English)</Label><Textarea value={whatsnew} onChange={(e) => setWhatsnew(e.target.value)} rows={2} /></div>
        <div><Label>What's new (French)</Label><Textarea value={whatsnewFr} onChange={(e) => setWhatsnewFr(e.target.value)} rows={2} /></div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div><Label>Who this is for (English)</Label><Textarea value={audience} onChange={(e) => setAudience(e.target.value)} rows={2} /></div>
        <div><Label>Who this is for (French)</Label><Textarea value={audienceFr} onChange={(e) => setAudienceFr(e.target.value)} rows={2} /></div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div><Label>Base price (USD)</Label><Input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} required /></div>
        <div><Label>Cohort size (5–10)</Label><Input type="number" min={5} max={10} value={cohortSize} onChange={(e) => setCohortSize(Number(e.target.value))} required /></div>
        <div>
          <Label>Mode</Label>
          <Select value={mode} onValueChange={(v) => setMode(v as "online" | "physical" | "hybrid")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="physical">Physical</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter><Button type="submit">Save course</Button></DialogFooter>
    </form>
  );
}

function AdminCohortsPanel() {
  const { cohorts, courses, enrollments, assignTutorToCohort } = useApp();
  const [tutorEmailInput, setTutorEmailInput] = useState<Record<string, string>>({});
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold">Cohorts</h3>
      <p className="text-sm text-muted-foreground">Students auto-fill cohorts by course and macro-region cluster. Assign a tutor once a cluster cohort is ready.</p>
      {cohorts.length === 0 && <Card className="p-8 text-center text-sm text-muted-foreground">No cohorts yet. Enrollments will create them automatically.</Card>}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {REGIONAL_CLUSTERS.map((cluster) => (
          <Card key={cluster.code} className="p-3">
            <div className="text-xs font-bold text-primary">{cluster.code}</div>
            <div className="mt-1 text-sm font-medium">{cluster.shortLabel}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {enrollments.filter((entry) => entry.clusterCode === cluster.code).length} students · {cluster.timezone}
            </div>
          </Card>
        ))}
      </div>
      <div className="grid gap-3">
        {cohorts.map((c) => {
          const course = courses.find((x) => x.id === c.courseId);
          const students = enrollments.filter((e) => c.studentIds.includes(e.id));
          const full = students.length >= (course?.cohortSize ?? 8);
          return (
            <Card key={c.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold">{course?.title.en} · Cohort {c.number}</p>
                    <Badge variant="outline">{c.clusterCode ?? "EAST_ANG"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{students.length}/{course?.cohortSize} students · {clusterLabel(c.clusterCode)} · {clusterTimezone(c.clusterCode)} · {full ? "Full" : "Filling"} · {c.completed ? "Completed" : "Active"}</p>
                  <p className="text-xs text-muted-foreground">Tutor: {c.tutorEmail ?? "unassigned"}</p>
                </div>
                {!c.completed && (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="tutor@email.com (e.g. sophia2@gmail.com)"
                      value={tutorEmailInput[c.id] ?? c.tutorEmail ?? ""}
                      onChange={(ev) => setTutorEmailInput((s) => ({ ...s, [c.id]: ev.target.value }))}
                      className="w-64"
                    />
                    <Button size="sm" onClick={() => {
                      const em = (tutorEmailInput[c.id] ?? "").trim();
                      if (!em) { toast.error("Enter a tutor email"); return; }
                      assignTutorToCohort(c.id, em);
                      toast.success("Tutor assigned");
                    }}>Assign tutor</Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function AdminGraduatePanel() {
  const { pendingCertifications, issueCertificate, courses } = useApp();
  const [files, setFiles] = useState<Record<string, string>>({});
  const onFile = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setFiles((s) => ({ ...s, [id]: String(reader.result) }));
    reader.readAsDataURL(f);
  };
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold">Graduate School</h3>
      <p className="text-sm text-muted-foreground">Approve tutor-submitted graduates and issue their certificates.</p>
      {pendingCertifications.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">No pending graduations.</Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Certificate</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingCertifications.map((p) => {
                const course = courses.find((c) => c.id === p.courseId);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.studentName}</TableCell>
                    <TableCell>{course?.title.en}</TableCell>
                    <TableCell>
                      <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
                        <Upload className="h-4 w-4" />
                        <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => onFile(p.id, e)} />
                        {files[p.id] ? "Uploaded" : "Upload file"}
                      </label>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => { issueCertificate(p.id, files[p.id]); toast.success("Certificate issued"); }}>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Certify to Submit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

/* ================== TUTOR RECORDINGS ================== */
type Recording = { id: string; cohortId: string; title: string; url: string; createdAt: string };

function TutorRecordings({ cohorts }: { cohorts: Cohort[] }) {
  const { courses } = useApp();
  const [recordings, setRecordings] = useState<Recording[]>(() => {
    try { return JSON.parse(localStorage.getItem("serenog.recordings") ?? "[]"); } catch { return []; }
  });
  const [activeCohortId, setActiveCohortId] = useState(cohorts[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    localStorage.setItem("serenog.recordings", JSON.stringify(recordings));
  }, [recordings]);

  useEffect(() => {
    if (!cohorts.find((c) => c.id === activeCohortId)) setActiveCohortId(cohorts[0]?.id ?? "");
  }, [cohorts, activeCohortId]);

  if (cohorts.length === 0) {
    return (
      <Card className="p-10 text-center">
        <Video className="mx-auto h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-bold">No cohort assigned yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Once the admin assigns you to a cohort, you'll be able to upload class recordings here for your students.
        </p>
      </Card>
    );
  }

  const activeCohort = cohorts.find((c) => c.id === activeCohortId);
  const activeCourse = courses.find((c) => c.id === activeCohort?.courseId);
  const cohortRecordings = recordings.filter((r) => r.cohortId === activeCohortId);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || !activeCohort) return;
    setRecordings((prev) => [
      { id: crypto.randomUUID(), cohortId: activeCohort.id, title: title.trim(), url: url.trim(), createdAt: new Date().toISOString() },
      ...prev,
    ]);
    setTitle(""); setUrl("");
    toast.success("Recording added");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <Card className="p-3">
        <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Cohorts</p>
        <div className="space-y-1">
          {cohorts.map((c) => {
            const course = courses.find((x) => x.id === c.courseId);
            return (
              <button key={c.id} onClick={() => setActiveCohortId(c.id)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm ${activeCohortId === c.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                <div className="font-medium truncate">{course?.title.en ?? "Course"}</div>
                <div className="text-xs opacity-70">Cohort {c.number}</div>
              </button>
            );
          })}
        </div>
      </Card>
      <Card className="p-5">
        <h3 className="text-lg font-bold">{activeCourse?.title.en ?? "Cohort"} · Cohort {activeCohort?.number}</h3>
        <p className="text-xs text-muted-foreground">Post a recording link (Zoom, Google Meet, YouTube unlisted, etc.).</p>
        <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
          <Input placeholder="Session title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input placeholder="Recording URL" type="url" value={url} onChange={(e) => setUrl(e.target.value)} required />
          <Button type="submit"><Video className="mr-2 h-4 w-4" /> Add</Button>
        </form>
        <div className="mt-6 space-y-2">
          {cohortRecordings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recordings yet for this cohort.</p>
          ) : cohortRecordings.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</p>
              </div>
              <Button asChild size="sm" variant="outline"><a href={r.url} target="_blank" rel="noreferrer">Open</a></Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ================== ADMIN TUTOR APPLICATIONS ================== */
function AdminTutorApplicationsPanel() {
  const { tutorApplications, updateTutorApplication } = useApp();
  const pending = tutorApplications.filter((a) => a.status === "pending");
  const decided = tutorApplications.filter((a) => a.status !== "pending");

  const approve = async (id: string, userId: string | null | undefined, fullName: string) => {
    const { error: updateError } = await supabase
      .from("tutor_applications")
      .update({ status: "approved" })
      .eq("id", id);
    if (updateError) return toast.error(updateError.message);
    if (userId) {
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "tutor" });
      if (roleError && !roleError.message.includes("duplicate")) {
        return toast.error(roleError.message);
      }
    }
    updateTutorApplication(id, { status: "approved" });
    toast.success(`Approved ${fullName} as tutor`);
  };

  const reject = async (id: string, fullName: string) => {
    const { error } = await supabase
      .from("tutor_applications")
      .update({ status: "rejected" })
      .eq("id", id);
    if (error) return toast.error(error.message);
    updateTutorApplication(id, { status: "rejected" });
    toast.success(`Rejected ${fullName}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold">Pending applications</h3>
        <p className="text-sm text-muted-foreground">Applicants stay in a "pending" state on their dashboard until you decide.</p>
      </div>

      {pending.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">No pending tutor applications.</Card>
      ) : (
        <div className="grid gap-3">
          {pending.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <InitialAvatar name={a.fullName} className="h-9 w-9" />
                    <div>
                      <p className="font-bold">{a.fullName}</p>
                      <p className="text-xs text-muted-foreground">{a.email} · {a.country || "—"}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm"><span className="font-semibold">Specialization:</span> {a.specialization}</p>
                  {a.experience && <p className="mt-1 text-sm"><span className="font-semibold">Experience:</span> {a.experience}</p>}
                  {a.bio && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{a.bio}</p>}
                  {a.resumeUrl && (
                    <a href={a.resumeUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <Upload className="h-3 w-3" /> View resume {a.resumeName ? `(${a.resumeName})` : ""}
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => reject(a.id, a.fullName)}>
                    <XCircle className="mr-2 h-4 w-4" /> Reject
                  </Button>
                  <Button size="sm" onClick={() => approve(a.id, null, a.fullName)}>
                    <UserCheck className="mr-2 h-4 w-4" /> Approve as Tutor
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {decided.length > 0 && (
        <div>
          <h3 className="mt-8 text-lg font-bold">Decided</h3>
          <Card className="mt-2 overflow-hidden p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Decided</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {decided.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.fullName}<div className="text-xs text-muted-foreground">{a.email}</div></TableCell>
                    <TableCell>{a.specialization}</TableCell>
                    <TableCell>
                      <Badge variant={a.status === "approved" ? "default" : "secondary"} className="capitalize">{a.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}
