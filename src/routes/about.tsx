import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/app-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Eye, Check, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Afritech Academy" },
      {
        name: "description",
        content: "Pan-African EdTech institution: bilingual, project-based, cohort-driven.",
      },
      {
        property: "og:title",
        content: "About Afritech Academy",
      },
      {
        property: "og:description",
        content: "Bilingual tech education built for the continent.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t, lang } = useApp();

  return (
    <div className="bg-background">
      {/* Header */}
      <section className="border-b border-border bg-white">
        <div className="container-section py-16 sm:py-20">
          <Badge
            variant="secondary"
            className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            About
          </Badge>
          <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {t("about.title")}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            {t("about.desc")}
          </p>
        </div>
      </section>

      {/* Stats — all 0 as required */}
      <section className="container-section -mt-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: lang === "en" ? "Learners" : "Apprenants", value: "0" },
            { label: lang === "en" ? "Countries" : "Pays", value: "0" },
            { label: lang === "en" ? "Cohorts" : "Cohortes", value: "0" },
          ].map((s) => (
            <Card
              key={s.label}
              className="rounded-xl border bg-white p-6 text-center shadow-sm"
            >
              <p className="font-heading text-4xl font-extrabold text-primary">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Core values */}
      <section className="container-section py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Bullet points */}
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              {lang === "en"
                ? "Why Afritech Academy?"
                : "Pourquoi Afritech Academy ?"}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {lang === "en"
                ? "We're building Africa's most accessible tech education platform — bilingual, project-based, and designed for the realities of our continent."
                : "Nous construisons la plateforme d'éducation tech la plus accessible d'Afrique — bilingue, par projet, conçue pour les réalités de notre continent."}
            </p>
            <ul className="mt-8 space-y-4">
              {["about.b1", "about.b2", "about.b3", "about.b4"].map((k) => (
                <li
                  key={k}
                  className="flex items-start gap-3 text-sm text-foreground"
                >
                  <div className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                    <Check className="h-3 w-3" />
                  </div>
                  {t(k)}
                </li>
              ))}
            </ul>
          </div>

          {/* Mission & Vision cards */}
          <div className="grid gap-6">
            <Card className="rounded-xl border bg-white p-7 shadow-sm card-hover">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="mt-5 font-heading text-xl font-bold text-foreground">
                {t("about.mission")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t("about.missiondesc")}
              </p>
            </Card>
            <Card className="rounded-xl border bg-white p-7 shadow-sm card-hover">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent/10 text-accent">
                <Eye className="h-6 w-6" />
              </div>
              <h2 className="mt-5 font-heading text-xl font-bold text-foreground">
                {t("about.vision")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t("about.visiondesc")}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Image placeholder section */}
      <section className="border-t border-border bg-white">
        <div className="container-section py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                {lang === "en"
                  ? "Pan-African, by design"
                  : "Panafricain, par conception"}
              </h2>
              <p className="mt-3 text-muted-foreground">
                {lang === "en"
                  ? "With hubs in Lagos, Abidjan, Douala, Dakar, Accra and Nairobi, our reach spans West, Central and East Africa — delivering the same high-quality education in English and French."
                  : "Avec des hubs à Lagos, Abidjan, Douala, Dakar, Accra et Nairobi, notre portée couvre l'Afrique de l'Ouest, Centrale et de l'Est — offrant la même éducation de qualité en anglais et en français."}
              </p>
            </div>
            <div className="aspect-[4/3] w-full rounded-xl bg-gradient-to-br from-primary/10 via-background to-accent/10 grid place-items-center">
              <GraduationCap className="h-16 w-16 text-primary/30" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
