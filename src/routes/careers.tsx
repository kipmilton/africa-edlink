import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile, validateUpload } from "@/lib/storage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  Users,
  CheckCircle,
  Send,
  ArrowRight,
} from "lucide-react";
import careerImg from "@/assets/career img.webp";
import { toast } from "sonner";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — Serencog Technologies" },
      {
        name: "description",
        content:
          "Join our faculty as a tutor. Apply to teach at Serencog and shape the next generation of African tech talent.",
      },
      {
        property: "og:title",
        content: "Careers — Serencog Technologies",
      },
      {
        property: "og:description",
        content:
          "Apply to teach, mentor, and build with Serencog.",
      },
    ],
  }),
  component: CareersPage,
});

const specializations = [
  "Full Stack Development",
  "Artificial Intelligence",
  "Machine Learning",
  "Data Analytics",
  "Data Science",
  "Cybersecurity",
  "Mobile Development",
  "Cloud Engineering",
  "DevOps",
  "Product Design",
];

/* ---------- Hero placeholder ---------- */

function CareersHeroPlaceholder() {
  return (
    <div className="aspect-4/3 w-full overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-background to-accent/10 grid place-items-center">
      <img src={careerImg} alt="Careers" className="object-cover h-full w-full" />
    </div>
  );
}

/* ---------- Page ---------- */

function CareersPage() {
  const { lang, addTutorApplication } = useApp();
  const T = (en: string, fr: string) => (lang === "en" ? en : fr);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [specialization, setSpecialization] = useState(specializations[0]);
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingStatus, setExistingStatus] = useState<"pending" | "approved" | "rejected" | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const email = auth.user?.email;
      if (!email) return;
      const { data } = await supabase
        .from("tutor_applications")
        .select("status")
        .eq("email", email.toLowerCase())
        .order("created_at", { ascending: false })
        .limit(1);
      const status = data?.[0]?.status as "pending" | "approved" | "rejected" | undefined;
      if (active && status) setExistingStatus(status);
      if (active && auth.user?.email) setEmail((prev) => prev || auth.user!.email!);
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setResumeError("");
    if (!file) {
      setResume(null);
      return;
    }
    const invalid = validateUpload("tutor-cvs", file);
    if (invalid) {
      setResume(null);
      setResumeError(
        T(
          "Upload a PDF or Word document under 15MB.",
          "Téléversez un PDF ou un document Word de moins de 15 Mo.",
        ),
      );
      return;
    }
    setResume(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resumeError) return;

    // Tutor applications are row-level-security scoped to the applicant, so a
    // session is required before we upload anything.
    const { data: preUser } = await supabase.auth.getUser();
    if (!preUser.user) {
      toast.error(
        T(
          "Please sign in (or create an account) before applying to teach.",
          "Veuillez vous connecter (ou créer un compte) avant de postuler.",
        ),
      );
      return;
    }
    if (fullName.trim().length < 2 || bio.trim().length < 20) {
      toast.error(
        T(
          "Add your full name and at least a short paragraph about your teaching.",
          "Ajoutez votre nom complet et un court paragraphe sur votre enseignement.",
        ),
      );
      return;
    }
    let resumeUrl: string | undefined;
    let resumeName: string | undefined;
    let resumeSize: number | undefined;

    if (resume) {
      setUploadingResume(true);
      try {
        const uploaded = await uploadFile("tutor-cvs", resume, {
          prefix: preUser.user.id,
          signed: true,
        });
        resumeUrl = uploaded.url;
        resumeName = resume.name;
        resumeSize = resume.size;
      } catch (uploadError) {
        setResumeError(
          T(
            "CV upload failed — your application will be sent without it.",
            "Le téléversement du CV a échoué — votre candidature sera envoyée sans celui-ci.",
          ),
        );
        toast.error(uploadError instanceof Error ? uploadError.message : String(uploadError));
      } finally {
        setUploadingResume(false);
      }
    }

    // Persist to Supabase so admins can review from any device.
    const { error: insertError } = await supabase.from("tutor_applications").insert({
      user_id: preUser.user.id,
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      country: country.trim(),
      specialization,
      bio: bio.trim(),
      experience: experience.trim(),
      resume_name: resumeName,
      resume_size: resumeSize,
      resume_url: resumeUrl,
      status: "pending",
    });
    if (insertError) {
      toast.error(insertError.message);
      return;
    }
    // Also keep local optimistic copy.
    addTutorApplication({
      fullName,
      email,
      phone,
      country,
      specialization,
      bio,
      experience,
      resumeName,
      resumeSize,
      resumeUrl,
    });
    setSubmitted(true);
    toast.success(
      T(
        "Application submitted! We'll be in touch within 48 hours.",
        "Candidature soumise ! Nous vous contacterons sous 48 heures.",
      ),
    );
  };

  // --- Benefits data ---
  const benefits = [
    {
      icon: Users,
      title: T("Small Cohorts", "Petites Cohortes"),
      desc: T(
        "Teach groups of 5–10 students for meaningful mentorship.",
        "Enseignez à des groupes de 5 à 10 étudiants pour un mentorat de qualité.",
      ),
    },
    {
      icon: GraduationCap,
      title: T("Flexible Schedule", "Horaires Flexibles"),
      desc: T(
        "Set your own hours — live sessions plus async support.",
        "Fixez vos propres horaires — sessions live et suivi asynchrone.",
      ),
    },
    {
      icon: CheckCircle,
      title: T("Bilingual Environment", "Environnement Bilingue"),
      desc: T(
        "Teach in English, French, or both — your choice.",
        "Enseignez en anglais, en français ou les deux — à votre choix.",
      ),
    },
  ];

  if (submitted || existingStatus) {
    const heading =
      existingStatus === "approved"
        ? T("You're approved!", "Vous êtes approuvé !")
        : existingStatus === "rejected"
          ? T("Application reviewed", "Candidature examinée")
          : T("Application Received!", "Candidature Reçue !");
    const body =
      existingStatus === "approved"
        ? T(
            "Welcome to the faculty. Your tutor dashboard is now unlocked.",
            "Bienvenue dans la faculté. Votre tableau de bord tuteur est maintenant débloqué.",
          )
        : existingStatus === "rejected"
          ? T(
              "Thank you for applying. This application was not successful — you're welcome to reapply next intake.",
              "Merci d'avoir postulé. Cette candidature n'a pas abouti — vous pouvez postuler à la prochaine session.",
            )
          : T(
              "Your application is pending review. Our academic team will reach out within 48 hours.",
              "Votre candidature est en attente d'examen. Notre équipe académique vous contactera sous 48 heures.",
            );
    return (
      <div className="bg-background">
        <section className="border-b border-border bg-white">
          <div className="container-section py-16 sm:py-20">
            <Badge
              variant="secondary"
              className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {existingStatus === "pending" ? T("Pending review", "En attente d'examen") : "Careers"}
            </Badge>
            <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              {heading}
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
              {body}
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="rounded-xl px-8 py-6 text-base font-bold shadow-sm">
                <Link to={existingStatus === "approved" ? "/dashboard" : "/"}>
                  {existingStatus === "approved"
                    ? T("Go to dashboard", "Aller au tableau de bord")
                    : T("Back to Home", "Retour à l'accueil")}{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-background">
      {/* Header */}
      <section className="border-b border-border bg-white">
        <div className="container-section py-16 sm:py-20">
          <Badge
            variant="secondary"
            className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Careers
          </Badge>
          <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {T(
              "Join Our Faculty",
              "Rejoignez Notre Faculté",
            )}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            {T(
              "We're looking for passionate tech professionals to teach, mentor, and shape the next generation of African builders.",
              "Nous recherchons des professionnels passionnés de la tech pour enseigner, encadrer et façonner la prochaine génération de bâtisseurs africains.",
            )}
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="container-section -mt-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <Card
                key={b.title}
                className="rounded-xl border bg-white p-6 text-center shadow-sm card-hover"
              >
                <Icon className="mx-auto h-6 w-6 text-primary" />
                <h3 className="mt-4 font-heading text-lg font-bold text-foreground">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Form + Image */}
      <section className="container-section py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Application Form */}
          <Card className="rounded-xl border bg-white p-8 shadow-sm">
            <h2 className="font-heading text-2xl font-bold text-foreground">
              {T("Apply Now", "Postulez Maintenant")}
            </h2>
            <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    {T("Full Name", "Nom Complet")}
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Joseph"
                    className="rounded-lg"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@email.com"
                    className="rounded-lg"
                  />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    {T("Phone", "Téléphone")}
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+225 07 00 00 00 00"
                    className="rounded-lg"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country" className="text-sm font-medium">
                    {T("Country", "Pays")}
                  </Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    placeholder="Côte d'Ivoire"
                    className="rounded-lg"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">
                  {T("Specialization", "Spécialisation")}
                </Label>
                <Select
                  value={specialization}
                  onValueChange={setSpecialization}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="experience" className="text-sm font-medium">
                  {T(
                    "Years of Experience",
                    "Années d'Expérience",
                  )}
                </Label>
                <Input
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  required
                  placeholder="5+"
                  className="rounded-lg"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="resume" className="text-sm font-medium">
                  {T("Upload your CV", "Téléchargez votre CV")}
                </Label>
                <div className="rounded-xl border border-border bg-muted/50 px-4 py-3">
                  <input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    className="w-full text-sm text-foreground file:cursor-pointer file:rounded-full file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
                  />
                  {resume && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {resume.name} · {(resume.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                  {resumeError && (
                    <p className="mt-2 text-sm text-destructive">{resumeError}</p>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio" className="text-sm font-medium">
                  {T("Bio & Teaching Philosophy", "Bio et Philosophie d'Enseignement")}
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="min-h-30 rounded-lg"
                  rows={4}
                  required
                  placeholder={T(
                    "Tell us about your background, teaching approach, and why you want to join Serencog...",
                    "Parlez-nous de votre parcours, de votre approche pédagogique et de pourquoi vous souhaitez rejoindre Serencog...",
                  )}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-fit rounded-xl px-8 py-6 text-base font-bold shadow-sm"
              >
                <Send className="mr-2 h-4 w-4" />
                {T("Submit Application", "Soumettre la Candidature")}
              </Button>
            </form>
          </Card>

          {/* Right side */}
          <div className="grid gap-6">
            <CareersHeroPlaceholder />
            <Card className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-foreground">
                {T("What We're Looking For", "Ce Que Nous Recherchons")}
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {[
                  T(
                    "2+ years of professional experience in your field",
                    "2+ ans d'expérience professionnelle dans votre domaine",
                  ),
                  T(
                    "Passion for teaching and mentoring",
                    "Passion pour l'enseignement et le mentorat",
                  ),
                  T(
                    "Fluency in English and/or French",
                    "Maîtrise de l'anglais et/ou du français",
                  ),
                  T(
                    "Reliable internet connection",
                    "Connexion internet fiable",
                  ),
                  T(
                    "Experience with remote teaching tools",
                    "Expérience des outils d'enseignement à distance",
                  ),
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="container-section text-center">
          <h2 className="font-heading text-3xl font-extrabold text-primary-foreground sm:text-4xl">
            {T(
              "Ready to make an impact?",
              "Prêt à avoir un impact ?",
            )}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-primary-foreground/80">
            {T(
              "Join a community of educators building Africa's tech talent pipeline.",
              "Rejoignez une communauté d'éducateurs qui construisent le pipeline de talents tech en Afrique.",
            )}
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="mt-8 rounded-xl px-8 py-6 text-base font-bold shadow-sm"
          >
            <a href="#">
              {T("Apply Now", "Postulez")}{" "}
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
