import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp, type Role, type LocalCourse } from "@/lib/app-context";
import { useAuth } from "@/lib/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Users, GraduationCap, MessageSquare, Search, FileCheck, Globe2, Play,
  Plus, Calendar, Clock, Video, Link2, BookOpen, Upload, Wallet,
  Smartphone, CreditCard, Award,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Afritech Academy" }] }),
  component: DashboardPage,
});

/* ---------- Helpers ---------- */
function ytEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (u.pathname.startsWith("/embed/")) return url;
    }
    return null;
  } catch { return null; }
}

function InitialAvatar({ name, className }: { name: string; className?: string }) {
  const initials = name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  return (
    <Avatar className={className}>
      <AvatarFallback className="bg-primary text-primary-foreground font-bold">{initials}</AvatarFallback>
    </Avatar>
  );
}

/* ---------- Root ---------- */
function DashboardPage() {
  const { role, setRole, lang } = useApp();
  const { user, role: authRole, loading } = useAuth();
  const navigate = useNavigate();
  const T = (en: string, fr: string) => (lang === "en" ? en : fr);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (authRole) setRole(authRole as Role);
  }, [authRole, setRole]);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-muted-foreground">
        {T("Loading your dashboard…", "Chargement de votre tableau de bord…")}
      </div>
    );
  }

  const canSwitch = authRole === "admin";
  const displayName = (user.email ?? "there").split("@")[0];

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-accent/80">{T("Dashboard", "Tableau de bord")}</p>
            <h1 className="truncate text-2xl font-heading font-extrabold sm:text-3xl">
              {T(`Welcome back, ${displayName}`, `Bon retour, ${displayName}`)}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {canSwitch ? (
              <>
                <span className="hidden text-xs text-muted-foreground sm:inline">{T("View as", "Voir en tant que")}</span>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger className="w-[160px] rounded-lg border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">{T("Student", "Étudiant")}</SelectItem>
                    <SelectItem value="tutor">{T("Tutor", "Tuteur")}</SelectItem>
                    <SelectItem value="admin">{T("Admin", "Admin")}</SelectItem>
                  </SelectContent>
                </Select>
              </>
            ) : (
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide">
                {authRole === "tutor" ? T("Tutor", "Tuteur") : T("Student", "Étudiant")}
              </Badge>
            )}
            <InitialAvatar name={displayName} className="h-9 w-9" />
          </div>
        </div>

        <div className="mt-8">
          {role === "student" && <StudentDash />}
          {role === "tutor" && <TutorDash />}
          {role === "admin" && <AdminDash />}
        </div>
      </div>
    </div>
  );
}

/* ---------- Recording type ---------- */
type Recording = {
  id: string;
  title: string;
  course: string;
  date: string;
  tutor: string;
  youtube: string;
};

const seedRecordings: Recording[] = [
  { id: "r1", title: "React Hooks Deep-Dive", course: "Full Stack Development", date: "Jun 21, 2026", tutor: "Joseph", youtube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  { id: "r2", title: "Intro to Postgres Indexes", course: "Full Stack Development", date: "Jun 18, 2026", tutor: "Joseph", youtube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  { id: "r3", title: "Transformers Explained", course: "Artificial Intelligence", date: "Jun 12, 2026", tutor: "Joseph", youtube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
];

type UpcomingClass = {
  id: string;
  course: string;
  day: string;
  time: string;
  tutor: string;
  platform: string;
  link: string;
};

const seedUpcoming: UpcomingClass[] = [
  { id: "c1", course: "Full Stack Development", day: "Wednesday", time: "7:00 PM", tutor: "Joseph", platform: "Google Meet", link: "https://meet.google.com/abc-defg-hij" },
  { id: "c2", course: "Artificial Intelligence", day: "Friday", time: "6:00 PM", tutor: "Joseph", platform: "Zoom", link: "https://zoom.us/j/1234567890" },
  { id: "c3", course: "Cybersecurity", day: "Saturday", time: "10:00 AM", tutor: "Joseph", platform: "Microsoft Teams", link: "https://teams.microsoft.com/l/meetup-join/xyz" },
];

/* ---------- STUDENT ---------- */
function StudentDash() {
  const { lang } = useApp();
  const T = (en: string, fr: string) => (lang === "en" ? en : fr);
  const [lowBw, setLowBw] = useState(false);
  const [playing, setPlaying] = useState<Recording | null>(null);

  return (
    <Tabs defaultValue="overview">
      <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-card p-1 sm:w-auto">
        <TabsTrigger value="overview">{T("Overview", "Aperçu")}</TabsTrigger>
        <TabsTrigger value="classes">{T("Classes", "Cours")}</TabsTrigger>
        <TabsTrigger value="recordings">{T("Recordings", "Enregistrements")}</TabsTrigger>
        <TabsTrigger value="projects">{T("Projects", "Projets")}</TabsTrigger>
        <TabsTrigger value="pay">{T("Payments", "Paiements")}</TabsTrigger>
      </TabsList>

      {/* OVERVIEW */}
      <TabsContent value="overview" className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{T("Current Course", "Cours actuel")}</p>
              <h3 className="text-xl font-bold">Full Stack Development</h3>
            </div>
            <Badge className="rounded-full">{T("In progress", "En cours")}</Badge>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm"><span>{T("Overall progress", "Progression globale")}</span><span className="font-bold">0%</span></div>
            <Progress value={0} className="mt-2" />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: "HTML/CSS", v: 0 },
              { label: "React", v: 0 },
              { label: "Node + DB", v: 0 },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-sm"><span>{m.label}</span><span className="font-bold">{m.v}%</span></div>
                <Progress value={m.v} className="mt-1.5" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-xs text-muted-foreground">{T("Attendance", "Présence")}</p>
          <p className="mt-1 text-3xl font-black">0%</p>
          <p className="mt-1 text-xs text-muted-foreground">{T("No sessions attended yet.", "Aucune session pour l'instant.")}</p>
        </Card>

        <Card className="p-6 lg:col-span-3">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-bold">{T("Low-Bandwidth Mode", "Mode Faible Bande Passante")}</p>
              <p className="text-sm text-muted-foreground">{T("Compresses video and images for slow networks — perfect for 3G.", "Compresse vidéo et images pour les réseaux lents — idéal pour la 3G.")}</p>
            </div>
            <Switch checked={lowBw} onCheckedChange={setLowBw} />
          </div>
          {lowBw && <p className="mt-3 text-xs text-accent">⚡ {T("Saving data on live sessions.", "Économie de données sur les sessions live.")}</p>}
        </Card>
      </TabsContent>

      {/* UPCOMING CLASSES */}
      <TabsContent value="classes" className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {seedUpcoming.map((c) => (
          <Card key={c.id} className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-bold">{c.course}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><Calendar className="h-3.5 w-3.5" />{c.day}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground"><Clock className="h-3.5 w-3.5" />{c.time}</p>
              </div>
              <Badge variant="secondary" className="rounded-full">{c.platform}</Badge>
            </div>
            <div className="mt-4 flex items-center gap-2 border-t pt-3">
              <InitialAvatar name={c.tutor} className="h-8 w-8" />
              <div className="text-sm"><p className="text-xs text-muted-foreground">{T("Tutor", "Tuteur")}</p><p className="font-bold">{c.tutor}</p></div>
            </div>
            <Button asChild className="mt-4 w-full">
              <a href={c.link} target="_blank" rel="noreferrer"><Video className="mr-2 h-4 w-4" />{T("Join Class", "Rejoindre")}</a>
            </Button>
          </Card>
        ))}
      </TabsContent>

      {/* RECORDINGS */}
      <TabsContent value="recordings" className="mt-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold">{T("Previous Recordings", "Enregistrements précédents")}</h3>
          <p className="text-sm text-muted-foreground">{T("Click a recording to watch it here.", "Cliquez sur un enregistrement pour le lire ici.")}</p>
        </div>

        {playing && (
          <Card className="mb-6 overflow-hidden p-0">
            <div className="flex items-center justify-between border-b p-3">
              <div className="min-w-0"><p className="truncate font-bold">{playing.title}</p><p className="text-xs text-muted-foreground">{playing.course} · {playing.tutor}</p></div>
              <Button size="sm" variant="ghost" onClick={() => setPlaying(null)}>{T("Close", "Fermer")}</Button>
            </div>
            <div className="aspect-video w-full bg-black">
              {ytEmbedUrl(playing.youtube) ? (
                <iframe src={ytEmbedUrl(playing.youtube)!} className="h-full w-full" allow="autoplay; encrypted-media" allowFullScreen title={playing.title} />
              ) : (
                <div className="grid h-full place-items-center text-white">{T("Invalid link", "Lien invalide")}</div>
              )}
            </div>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {seedRecordings.map((r) => (
            <Card key={r.id} className="cursor-pointer overflow-hidden p-0 transition-all hover:-translate-y-1 hover:shadow-lg" onClick={() => setPlaying(r)}>
              <div className="relative grid aspect-video place-items-center bg-gradient-to-br from-primary/80 to-accent">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-white/20 backdrop-blur">
                  <Play className="h-6 w-6 text-white" fill="white" />
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold">{r.title}</h4>
                <p className="mt-1 text-xs text-muted-foreground">{r.course}</p>
                <div className="mt-3 flex items-center gap-2">
                  <InitialAvatar name={r.tutor} className="h-6 w-6" />
                  <span className="text-xs">{r.tutor}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{r.date}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>

      {/* PROJECTS */}
      <TabsContent value="projects" className="mt-6 grid gap-6 lg:grid-cols-3">
        {[
          { t: T("Project 1 — Portfolio site", "Projet 1 — Site portfolio"), s: T("Not started", "Non commencé"), grade: "—" },
          { t: T("Project 2 — Kanban app", "Projet 2 — App Kanban"), s: T("Not started", "Non commencé"), grade: "—" },
          { t: T("Project 3 — E-commerce API", "Projet 3 — API e-commerce"), s: T("Not started", "Non commencé"), grade: "—" },
        ].map((p) => (
          <Card key={p.t} className="p-5">
            <FileCheck className="h-5 w-5 text-primary" />
            <h3 className="mt-3 text-base font-bold">{p.t}</h3>
            <Badge variant="secondary" className="mt-2 rounded-full">{p.s}</Badge>
            <div className="mt-4 flex items-center justify-between text-sm"><span className="text-muted-foreground">Grade</span><span className="font-black text-accent">{p.grade}</span></div>
            <Button variant="outline" size="sm" className="mt-4 w-full">{T("Open brief", "Ouvrir le brief")}</Button>
          </Card>
        ))}
        <Card className="p-6 lg:col-span-3 bg-gradient-to-r from-primary to-accent text-primary-foreground">
          <div className="flex items-center gap-4">
            <Award className="h-10 w-10" />
            <div>
              <p className="text-sm opacity-80">{T("Verifiable Digital Certificate", "Certificat numérique vérifiable")}</p>
              <p className="text-xl font-black">{T("Available after capstone", "Disponible après le capstone")}</p>
            </div>
          </div>
        </Card>
      </TabsContent>

      {/* PAYMENTS */}
      <TabsContent value="pay" className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <p className="text-xs text-muted-foreground">{T("Total paid", "Total payé")}</p>
          <p className="text-2xl font-black">0 XOF</p>
          <p className="mt-1 text-xs text-muted-foreground">{T("No payments recorded yet.", "Aucun paiement enregistré.")}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-bold">{T("Payment Methods", "Moyens de paiement")}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {T("Flutterwave and Citipay integration coming soon.", "Intégration Flutterwave et Citipay à venir.")}
          </p>
          <div className="mt-4 flex gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-2 text-sm font-medium text-muted-foreground">
              <Wallet className="h-4 w-4" /> Flutterwave
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-2 text-sm font-medium text-muted-foreground">
              <Wallet className="h-4 w-4" /> Citipay
            </div>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

/* ---------- TUTOR ---------- */
type LiveClass = {
  id: string;
  title: string;
  course: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  platform: string;
  link: string;
};

function TutorDash() {
  const { lang, courses } = useApp();
  const T = (en: string, fr: string) => (lang === "en" ? en : fr);

  const [classes, setClasses] = useState<LiveClass[]>([
    { id: "lc1", title: "React Hooks Deep-Dive", course: "Full Stack Development", description: "Advanced patterns with useEffect and custom hooks.", date: "2026-07-08", time: "19:00", duration: "90 min", platform: "Google Meet", link: "https://meet.google.com/abc-defg-hij" },
  ]);
  const [recordings, setRecordings] = useState<Recording[]>(seedRecordings);
  const [playing, setPlaying] = useState<Recording | null>(null);
  const [openClass, setOpenClass] = useState(false);
  const [openRec, setOpenRec] = useState(false);

  return (
    <Tabs defaultValue="classes">
      <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-card p-1 sm:w-auto">
        <TabsTrigger value="classes">{T("Classes", "Cours")}</TabsTrigger>
        <TabsTrigger value="recordings">{T("Recorded Classes", "Enregistrements")}</TabsTrigger>
        <TabsTrigger value="cohorts">{T("Cohorts", "Cohortes")}</TabsTrigger>
        <TabsTrigger value="forum">{T("Discussion Forum", "Forum")}</TabsTrigger>
      </TabsList>

      {/* CLASSES */}
      <TabsContent value="classes" className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{T("Scheduled Classes", "Cours planifiés")}</h3>
            <p className="text-sm text-muted-foreground">{T("Create and manage your live sessions.", "Créez et gérez vos sessions en direct.")}</p>
          </div>
          <Dialog open={openClass} onOpenChange={setOpenClass}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />{T("Create Class", "Créer un cours")}</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{T("Create New Class", "Nouveau cours")}</DialogTitle></DialogHeader>
              <CreateClassForm
                courses={courses}
                onCreate={(c) => { setClasses((prev) => [c, ...prev]); setOpenClass(false); }}
                T={T}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {classes.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="font-bold">{c.title}</h4>
                  <p className="text-xs text-muted-foreground">{c.course}</p>
                </div>
                <Badge variant="secondary" className="rounded-full">{c.platform}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{c.date}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.time}</span>
                <span>{c.duration}</span>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-md border bg-muted/40 p-2 text-xs">
                <Link2 className="h-3 w-3 shrink-0" />
                <span className="truncate">{c.link}</span>
              </div>
              <Button asChild size="sm" className="mt-3 w-full" variant="outline">
                <a href={c.link} target="_blank" rel="noreferrer">{T("Open meeting", "Ouvrir la réunion")}</a>
              </Button>
            </Card>
          ))}
          {classes.length === 0 && (
            <Card className="p-8 text-center text-sm text-muted-foreground md:col-span-2">
              {T("No classes scheduled yet.", "Aucun cours planifié.")}
            </Card>
          )}
        </div>
      </TabsContent>

      {/* RECORDED */}
      <TabsContent value="recordings" className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{T("Recorded Classes", "Cours enregistrés")}</h3>
            <p className="text-sm text-muted-foreground">{T("Paste a YouTube link — no video uploads needed.", "Collez un lien YouTube — sans upload.")}</p>
          </div>
          <Dialog open={openRec} onOpenChange={setOpenRec}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />{T("Add Recording", "Ajouter")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{T("Add YouTube Recording", "Ajouter un enregistrement YouTube")}</DialogTitle></DialogHeader>
              <AddRecordingForm
                courses={courses}
                onCreate={(r) => { setRecordings((prev) => [r, ...prev]); setOpenRec(false); }}
                T={T}
              />
            </DialogContent>
          </Dialog>
        </div>

        {playing && (
          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b p-3">
              <div className="min-w-0"><p className="truncate font-bold">{playing.title}</p><p className="text-xs text-muted-foreground">{playing.course}</p></div>
              <Button size="sm" variant="ghost" onClick={() => setPlaying(null)}>{T("Close", "Fermer")}</Button>
            </div>
            <div className="aspect-video w-full bg-black">
              {ytEmbedUrl(playing.youtube) && (
                <iframe src={ytEmbedUrl(playing.youtube)!} className="h-full w-full" allow="autoplay; encrypted-media" allowFullScreen title={playing.title} />
              )}
            </div>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recordings.map((r) => (
            <Card key={r.id} className="cursor-pointer overflow-hidden p-0 transition-all hover:-translate-y-1 hover:shadow-lg" onClick={() => setPlaying(r)}>
              <div className="relative grid aspect-video place-items-center bg-gradient-to-br from-primary/80 to-accent">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-white/20 backdrop-blur">
                  <Play className="h-6 w-6 text-white" fill="white" />
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold">{r.title}</h4>
                <p className="mt-1 text-xs text-muted-foreground">{r.course}</p>
                <div className="mt-3 flex items-center gap-2">
                  <InitialAvatar name={r.tutor} className="h-6 w-6" />
                  <span className="text-xs">{r.tutor}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{r.date}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>

      {/* COHORTS */}
      <TabsContent value="cohorts" className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { l: T("Students", "Étudiants"), v: 0, i: GraduationCap },
          { l: T("Active cohorts", "Cohortes actives"), v: 0, i: Users },
          { l: T("Avg attendance", "Présence moy."), v: "0%", i: MessageSquare },
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

      {/* FORUM */}
      <TabsContent value="forum" className="mt-6 space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder={T("Search threads…", "Rechercher…")} className="max-w-md" />
        </div>
        <Card className="p-8 text-center text-sm text-muted-foreground">
          {T("No discussions yet.", "Aucune discussion.")}
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function CreateClassForm({
  courses, onCreate, T,
}: {
  courses: LocalCourse[];
  onCreate: (c: LiveClass) => void;
  T: (en: string, fr: string) => string;
}) {
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState(courses[0]?.title.en ?? "");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60 min");
  const [platform, setPlatform] = useState("Google Meet");
  const [link, setLink] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ id: crypto.randomUUID(), title, course, description, date, time, duration, platform, link });
  };

  return (
    <form onSubmit={submit} className="grid gap-3">
      <div><Label>{T("Class Title", "Titre du cours")}</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
      <div>
        <Label>{T("Course", "Cours")}</Label>
        <Select value={course} onValueChange={setCourse}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={c.title.en}>{c.title.en}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div><Label>{T("Description", "Description")}</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
      <div className="grid grid-cols-3 gap-2">
        <div><Label>{T("Date", "Date")}</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></div>
        <div><Label>{T("Time", "Heure")}</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required /></div>
        <div><Label>{T("Duration", "Durée")}</Label><Input value={duration} onChange={(e) => setDuration(e.target.value)} /></div>
      </div>
      <div>
        <Label>{T("Meeting Platform", "Plateforme")}</Label>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Google Meet">Google Meet</SelectItem>
            <SelectItem value="Zoom">Zoom</SelectItem>
            <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
            <SelectItem value="Other">{T("Other", "Autre")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>{T("Meeting Link", "Lien de la réunion")}</Label>
        <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://meet.google.com/..." required />
      </div>
      <DialogFooter><Button type="submit">{T("Create Class", "Créer")}</Button></DialogFooter>
    </form>
  );
}

function AddRecordingForm({
  courses, onCreate, T,
}: {
  courses: LocalCourse[];
  onCreate: (r: Recording) => void;
  T: (en: string, fr: string) => string;
}) {
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState(courses[0]?.title.en ?? "");
  const [youtube, setYoutube] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      id: crypto.randomUUID(), title, course, youtube,
      tutor: "Joseph",
      date: new Date().toLocaleDateString(),
    });
  };

  return (
    <form onSubmit={submit} className="grid gap-3">
      <div><Label>{T("Title", "Titre")}</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
      <div>
        <Label>{T("Course", "Cours")}</Label>
        <Select value={course} onValueChange={setCourse}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={c.title.en}>{c.title.en}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label>{T("YouTube Video Link", "Lien YouTube")}</Label>
        <Input value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="https://youtube.com/watch?v=..." required />
      </div>
      <DialogFooter><Button type="submit">{T("Add Recording", "Ajouter")}</Button></DialogFooter>
    </form>
  );
}

/* ---------- ADMIN ---------- */
function AdminDash() {
  const { lang } = useApp();
  const T = (en: string, fr: string) => (lang === "en" ? en : fr);

  return (
    <Tabs defaultValue="overview">
      <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-card p-1 sm:w-auto">
        <TabsTrigger value="overview">{T("Global Overview", "Vue Globale")}</TabsTrigger>
        <TabsTrigger value="courses">{T("Courses", "Cours")}</TabsTrigger>
        <TabsTrigger value="tutors">{T("Tutors", "Tuteurs")}</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6 grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { l: T("Students", "Étudiants"), v: "0", i: GraduationCap },
            { l: T("Tutors", "Tuteurs"), v: "0", i: Users },
            { l: T("Community Members", "Membres communauté"), v: "0", i: MessageSquare },
            { l: T("Revenue", "Revenu"), v: "0", i: Wallet },
            { l: T("Courses", "Cours"), v: "0", i: BookOpen },
          ].map((k) => {
            const I = k.i;
            return (
              <Card key={k.l} className="p-5">
                <div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">{k.l}</p><I className="h-4 w-4 text-primary" /></div>
                <p className="mt-2 text-3xl font-black">{k.v}</p>
              </Card>
            );
          })}
        </div>

        <Card className="p-6 text-center text-sm text-muted-foreground">
          {T("Metrics will populate once real data is connected.", "Les métriques se rempliront une fois les données réelles connectées.")}
        </Card>
      </TabsContent>

      <TabsContent value="courses" className="mt-6">
        <AdminCoursesPanel T={T} />
      </TabsContent>

      <TabsContent value="tutors" className="mt-6">
        <AdminTutorsPanel T={T} />
      </TabsContent>
    </Tabs>
  );
}

function AdminTutorsPanel({ T }: { T: (en: string, fr: string) => string }) {
  const { tutorApplications, updateTutorApplication, lang, courses } = useApp();
  const [assignId, setAssignId] = useState<string | null>(null);
  const [selectedCohort, setSelectedCohort] = useState("");

  const pending = tutorApplications.filter((a) => a.status === "pending");
  const approved = tutorApplications.filter((a) => a.status === "approved");
  const rejected = tutorApplications.filter((a) => a.status === "rejected");

  const handleApprove = (id: string) => {
    setAssignId(id);
    setSelectedCohort(courses[0]?.title.en ?? "");
  };

  const confirmApprove = () => {
    if (assignId && selectedCohort) {
      updateTutorApplication(assignId, { status: "approved", assignedCohort: selectedCohort });
      setAssignId(null);
    }
  };

  const handleReject = (id: string) => {
    updateTutorApplication(id, { status: "rejected" });
  };

  return (
    <div className="space-y-6">
      {/* Pending applications */}
      <div>
        <h3 className="text-lg font-bold flex items-center gap-2">
          {T("Pending Applications", "Candidatures en attente")}
          {pending.length > 0 && (
            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">
              {pending.length}
            </span>
          )}
        </h3>
        {pending.length === 0 ? (
          <Card className="mt-4 p-8 text-center text-sm text-muted-foreground">
            {T("No pending tutor applications.", "Aucune candidature en attente.")}
          </Card>
        ) : (
          <div className="mt-4 grid gap-4">
            {pending.map((app) => (
              <Card key={app.id} className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <InitialAvatar name={app.fullName} className="h-10 w-10" />
                      <div>
                        <h4 className="font-bold text-foreground">{app.fullName}</h4>
                        <p className="text-xs text-muted-foreground">{app.email} · {app.phone}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>{T("Country", "Pays")}: {app.country}</span>
                      <span>{T("Specialization", "Spécialisation")}: {app.specialization}</span>
                      <span>{T("Experience", "Expérience")}: {app.experience}</span>
                      <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{app.bio}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Dialog open={assignId === app.id} onOpenChange={(o) => { if (!o) setAssignId(null); }}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="rounded-lg" onClick={() => handleApprove(app.id)}>
                          {T("Approve", "Approuver")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>{T("Assign Cohort", "Assigner une cohorte")}</DialogTitle></DialogHeader>
                        <div className="grid gap-4 py-4">
                          <p className="text-sm text-muted-foreground">
                            {T("Select a cohort for", "Sélectionnez une cohorte pour")} <strong>{app.fullName}</strong>
                          </p>
                          <div className="grid gap-2">
                            <Label>{T("Cohort", "Cohorte")}</Label>
                            <Select value={selectedCohort} onValueChange={setSelectedCohort}>
                              <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {courses.map((c) => (
                                  <SelectItem key={c.id} value={c.title.en}>{c.title.en}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setAssignId(null)}>{T("Cancel", "Annuler")}</Button>
                          <Button onClick={confirmApprove}>{T("Confirm", "Confirmer")}</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="outline" className="rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleReject(app.id)}>
                      {T("Reject", "Rejeter")}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Approved */}
      <div>
        <h3 className="text-lg font-bold">{T("Approved Tutors", "Tuteurs approuvés")}</h3>
        {approved.length === 0 ? (
          <Card className="mt-4 p-8 text-center text-sm text-muted-foreground">
            {T("No approved tutors yet.", "Aucun tuteur approuvé.")}
          </Card>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {approved.map((app) => (
              <Card key={app.id} className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <InitialAvatar name={app.fullName} className="h-9 w-9" />
                  <div className="min-w-0">
                    <p className="font-bold text-foreground truncate">{app.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{app.specialization}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <Badge variant="secondary" className="rounded-full bg-green-100 text-green-700 border-green-200">
                    {T("Approved", "Approuvé")}
                  </Badge>
                  <span className="text-muted-foreground">{T("Cohort", "Cohorte")}: {app.assignedCohort}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Rejected */}
      {rejected.length > 0 && (
        <div>
          <h3 className="text-lg font-bold">{T("Rejected", "Rejetés")}</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rejected.map((app) => (
              <Card key={app.id} className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <InitialAvatar name={app.fullName} className="h-9 w-9" />
                  <div className="min-w-0">
                    <p className="font-bold text-foreground truncate">{app.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{app.specialization}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <Badge variant="secondary" className="rounded-full bg-red-100 text-red-700 border-red-200">
                    {T("Rejected", "Rejeté")}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminCoursesPanel({ T }: { T: (en: string, fr: string) => string }) {
  const { courses, addCourse, lang } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">{T("Course Management", "Gestion des cours")}</h3>
          <p className="text-sm text-muted-foreground">{T("Add, edit and organize your catalog.", "Ajoutez et organisez votre catalogue.")}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />{T("Add Course", "Ajouter un cours")}</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{T("Add New Course", "Nouveau cours")}</DialogTitle></DialogHeader>
            <AddCourseForm
              onCreate={(c) => { addCourse(c); setOpen(false); }}
              T={T}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <Card key={c.id} className="overflow-hidden p-0">
            {c.image ? (
              <img src={c.image} alt="" className="h-36 w-full object-cover" />
            ) : (
              <div className="grid h-36 w-full place-items-center bg-gradient-to-br from-primary/20 to-accent/20 text-2xl font-black text-primary">
                {c.title[lang].slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold">{c.title[lang]}</h4>
                <Badge variant="secondary" className="rounded-full capitalize">{c.delivery}</Badge>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.desc[lang]}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">{T("Edit", "Modifier")}</Button>
                <Button size="sm" variant="ghost" className="flex-1">{T("View", "Voir")}</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AddCourseForm({
  onCreate, T,
}: {
  onCreate: (c: LocalCourse) => void;
  T: (en: string, fr: string) => string;
}) {
  const [name, setName] = useState("Full Stack Development");
  const [mode, setMode] = useState<"online" | "physical" | "hybrid">("online");
  const [shortDesc, setShortDesc] = useState("Build production-ready web apps end-to-end with React, Node and PostgreSQL.");
  const [fullDesc, setFullDesc] = useState("Full Stack engineering is the craft of building both the user-facing interface and the server, database and APIs that power it.");
  const [primaryCta, setPrimaryCta] = useState("Enroll Now");
  const [secondaryCta, setSecondaryCta] = useState("Learn More");
  const [image, setImage] = useState<string>("");

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(f);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      id: crypto.randomUUID(),
      image,
      delivery: mode === "hybrid" ? "online" : mode,
      title: { en: name, fr: name },
      desc: { en: shortDesc, fr: shortDesc },
      what: { en: fullDesc, fr: fullDesc },
      whatsnew: { en: "", fr: "" },
      for: { en: "", fr: "" },
      primaryCta,
      secondaryCta,
    });
  };

  return (
    <form onSubmit={submit} className="grid gap-3">
      <div>
        <Label>{T("Course Image", "Image du cours")}</Label>
        <div className="mt-1 flex items-center gap-3">
          {image ? (
            <img src={image} alt="" className="h-16 w-24 rounded object-cover" />
          ) : (
            <div className="grid h-16 w-24 place-items-center rounded bg-muted text-xs text-muted-foreground">
              <Upload className="h-4 w-4" />
            </div>
          )}
          <Input type="file" accept="image/*" onChange={onImage} />
        </div>
      </div>
      <div><Label>{T("Course Name", "Nom du cours")}</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
      <div>
        <Label>{T("Learning Mode", "Mode d'apprentissage")}</Label>
        <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="online">{T("Online", "En ligne")}</SelectItem>
            <SelectItem value="physical">{T("Physical", "Présentiel")}</SelectItem>
            <SelectItem value="hybrid">{T("Hybrid", "Hybride")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div><Label>{T("Short Description", "Description courte")}</Label><Textarea value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} rows={2} /></div>
      <div><Label>{T("Full Description", "Description complète")}</Label><Textarea value={fullDesc} onChange={(e) => setFullDesc(e.target.value)} rows={4} /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label>{T("Primary Button", "Bouton principal")}</Label><Input value={primaryCta} onChange={(e) => setPrimaryCta(e.target.value)} /></div>
        <div><Label>{T("Secondary Button", "Bouton secondaire")}</Label><Input value={secondaryCta} onChange={(e) => setSecondaryCta(e.target.value)} /></div>
      </div>
      <DialogFooter><Button type="submit">{T("Save Course", "Enregistrer")}</Button></DialogFooter>
    </form>
  );
}
