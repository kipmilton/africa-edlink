import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { supabase } from "@/integrations/supabase/client";
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
import { toast } from "sonner";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — Serenog" },
      {
        name: "description",
        content:
          "Join our faculty as a tutor. Apply to teach at Serenog and shape the next generation of African tech talent.",
      },
      {
        property: "og:title",
        content: "Careers — Serenog",
      },
      {
        property: "og:description",
        content:
          "Apply to teach, mentor, and build with Serenog.",
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
      <GraduationCap className="h-16 w-16 text-primary/30" />
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

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setResumeError("");
    if (!file) {
      setResume(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setResume(null);
      setResumeError(
        T(
          "File must be smaller than 5MB.",
          "Le fichier doit être inférieur à 5 Mo.",
        ),
      );
      return;
    }
    setResume(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resumeError) return;
    let resumeUrl: string | undefined;
    let resumeName: string | undefined;
    let resumeSize: number | undefined;

    if (resume) {
      setUploadingResume(true);
      const filePath = `tutor-resumes/${crypto.randomUUID()}_${resume.name.replace(/\s+/g, "_")}`;
      const { error: uploadError } = await supabase.storage
        .from("tutor-resumes")
        .upload(filePath, resume, { upsert: false });
      setUploadingResume(false);
      if (uploadError) {
        setResumeError(
          T(
            "Resume upload failed. Please try again.",
            "Le téléchargement du CV a échoué. Veuillez réessayer.",
          ),
        );
        toast.error(uploadError.message);
        return;
      }
      const { data } = supabase.storage.from("tutor-resumes").getPublicUrl(filePath);
      resumeUrl = data.publicUrl;
      resumeName = resume.name;
      resumeSize = resume.size;
    }

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

  if (submitted) {
    return (
      <div className="bg-background">
        <section className="border-b border-border bg-white">
          <div className="container-section py-16 sm:py-20">
            <Badge
              variant="secondary"
              className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Careers
            </Badge>
            <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              {T("Application Received!", "Candidature Reçue !")}
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
              {T(
                "Thank you for applying to join our faculty. Our academic team will review your application and reach out within 48 hours.",
                "Merci d'avoir postulé pour rejoindre notre faculté. Notre équipe académique examinera votre candidature et vous contactera sous 48 heures.",
              )}
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="rounded-xl px-8 py-6 text-base font-bold shadow-sm">
                <Link to="/">
                  {T("Back to Home", "Retour à l'accueil")}{" "}
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
                    "Tell us about your background, teaching approach, and why you want to join Serenog...",
                    "Parlez-nous de votre parcours, de votre approche pédagogique et de pourquoi vous souhaitez rejoindre Serenog...",
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
