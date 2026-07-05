import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Languages,
  Target,
  Eye,
  Check,
  ChevronRight,
} from "lucide-react";
import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "Afritech Academy — Bilingual Tech Education for Africa",
      },
      {
        name: "description",
        content:
          "Full Stack, AI, ML, Data Science and Cybersecurity tracks in EN/FR for West, Central and East Africa.",
      },
      {
        property: "og:title",
        content: "Afritech Academy",
      },
      {
        property: "og:description",
        content: "Bilingual tech education built for African learners.",
      },
    ],
  }),
  component: Index,
});

/* ---------- Course image ---------- */

function CourseImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return <img src={src} alt={alt} className={cn("h-full w-full object-cover", className)} />;
}

/* ---------- Hero image ---------- */

function HeroImage() {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
      <img
        src={heroImg}
        alt="Afritech Academy campus and learning environment"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

/* ---------- Main component ---------- */

function Index() {
  const { t, lang, courses } = useApp();
  const [selectedId, setSelectedId] = useState(courses[0]?.id);
  const selectedCourse = courses.find((c) => c.id === selectedId) ?? courses[0];

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-background">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_oklch(0.22_0.045_260/0.03),_transparent_50%)]" />

        <div className="container-section grid items-center gap-12 pt-10 pb-20 lg:grid-cols-2 lg:gap-16 lg:pt-16 lg:pb-28">
          {/* Left: text */}
          <div className="max-w-xl">
            <Badge
              variant="secondary"
              className="rounded-full border border-border bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary"
            >
              <Languages className="mr-1.5 h-3.5 w-3.5 text-accent" />
              {t("hero.eyebrow")}
            </Badge>

            <h1 className="mt-6 font-heading text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.1]">
              {lang === "en"
                ? "Master Tomorrow's Tech,\nIn Your Language"
                : "Maîtrisez la Tech de Demain,\nDans Votre Langue"}
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("hero.desc")}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-xl px-8 py-6 text-base font-bold shadow-sm">
                <Link to="/courses">
                  {t("hero.cta")}{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-xl border-2 px-8 py-6 text-base font-semibold shadow-sm"
              >
                <a href="#courses">{t("hero.cta2")}</a>
              </Button>
            </div>

            {/* Language engine — no fake numbers */}
            <div className="mt-8 rounded-xl border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
                  <Languages className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-heading text-sm font-bold text-foreground">
                    {t("hero.engine")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("hero.enginedesc")}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground">
                  {lang}
                </span>
              </div>
            </div>
          </div>

          {/* Right: hero image */}
          <div className="relative">
            <HeroImage />
          </div>
        </div>
      </section>

      {/* ===== COURSES ===== */}
      <section
        id="courses"
        className="border-y border-border bg-white py-20"
      >
        <div className="container-section">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <Badge variant="secondary" className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Programs
              </Badge>
              <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                {t("courses.title")}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {t("courses.subtitle")}
              </p>
            </div>
            <Link
              to="/courses"
              className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-accent sm:flex"
            >
              {t("courses.learn")} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Course cards grid — no horizontal scroll on desktop */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <Card
                key={c.id}
                className={cn(
                  "group flex flex-col overflow-hidden rounded-xl border bg-white p-0 transition-all duration-200 card-hover",
                  selectedCourse.id === c.id && "ring-2 ring-accent/50",
                )}
              >
                {/* Course image */}
                <div className="relative h-48 w-full overflow-hidden">
                  <CourseImage src={c.image} alt={c.title[lang]} className="h-full w-full" />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    {c.title[lang]}
                  </h3>

                  <div className="mt-3">
                    <Badge
                      variant={c.delivery === "online" ? "default" : "secondary"}
                      className={cn(
                        "rounded-full px-3 py-0.5 text-xs font-semibold",
                        c.delivery === "online"
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "bg-accent/10 text-accent hover:bg-accent/20",
                      )}
                    >
                      {c.delivery === "online"
                        ? t("courses.online")
                        : c.delivery === "physical"
                          ? t("courses.physical")
                          : lang === "en"
                            ? "Hybrid"
                            : "Hybride"}
                    </Badge>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {c.desc[lang]}
                  </p>

                  <div className="mt-6 flex gap-3">
                    <Button size="sm" className="flex-1 rounded-lg">
                      {t("courses.enroll")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-lg"
                    >
                      {t("courses.learn")}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              to="/courses"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
            >
              {t("courses.learn")} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== COURSE Q&A ===== */}
      <section className="bg-background py-20">
        <div className="container-section grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <Badge variant="secondary" className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              FAQs
            </Badge>
            <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {t("qa.title")}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t("qa.subtitle")}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {courses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs font-semibold transition-all",
                    selectedCourse.id === c.id
                      ? "border-accent bg-accent text-accent-foreground shadow-sm"
                      : "border-border bg-white text-muted-foreground hover:border-primary hover:text-foreground",
                  )}
                >
                  {c.title[lang]}
                </button>
              ))}
            </div>
          </div>

          <Card className="rounded-xl border bg-white p-6 shadow-sm">
            <Accordion type="single" collapsible defaultValue="q1">
              <AccordionItem value="q1">
                <AccordionTrigger className="text-left text-base font-semibold text-foreground">
                  {t("qa.q1").replace("{x}", selectedCourse.title[lang])}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {selectedCourse.what[lang]}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2">
                <AccordionTrigger className="text-left text-base font-semibold text-foreground">
                  {t("qa.q2")}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {selectedCourse.whatsnew[lang]}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q3">
                <AccordionTrigger className="text-left text-base font-semibold text-foreground">
                  {t("qa.q3")}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {selectedCourse.for[lang]}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q4">
                <AccordionTrigger className="text-left text-base font-semibold text-foreground">
                  {t("qa.q4")}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {lang === "en"
                    ? "Bilingual delivery, small cohorts of 5–10, project-based curriculum, pay-as-you-learn billing, and a pan-African alumni network actively hiring."
                    : "Livraison bilingue, petites cohortes de 5 à 10, programme par projet, paiement échelonné et un réseau d'anciens panafricains qui recrute activement."}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section className="border-t border-border bg-white py-20">
        <div className="container-section">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <Badge variant="secondary" className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                About
              </Badge>
              <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                {t("about.title")}
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
                {t("about.desc")}
              </p>
              <ul className="mt-8 space-y-4">
                {["about.b1", "about.b2", "about.b3", "about.b4"].map(
                  (k) => (
                    <li
                      key={k}
                      className="flex items-start gap-3 text-sm text-foreground"
                    >
                      <div className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                        <Check className="h-3 w-3" />
                      </div>
                      {t(k)}
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="rounded-xl border bg-white p-7 shadow-sm card-hover">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-heading text-xl font-bold text-foreground">
                  {t("about.mission")}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {t("about.missiondesc")}
                </p>
              </Card>
              <Card className="rounded-xl border bg-white p-7 shadow-sm card-hover">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent/10 text-accent">
                  <Eye className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-heading text-xl font-bold text-foreground">
                  {t("about.vision")}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {t("about.visiondesc")}
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
