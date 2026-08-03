import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useMemo } from "react";
import { useApp } from "@/lib/app-context";
import { formatPrice } from "@/lib/currency";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Courses — Serencog Technologies" },
      {
        name: "description",
        content:
          "Browse our bilingual EN/FR advanced tech tracks across Full Stack, AI, ML, Data and Cybersecurity.",
      },
      {
        property: "og:title",
        content: "Courses — Serencog Technologies",
      },
      {
        property: "og:description",
        content: "Bilingual EN/FR cohorts across Africa.",
      },
    ],
  }),
  component: CoursesPage,
});

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

function CoursesPage() {
  const { t, lang, courseFields, courses, currency } = useApp();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const search = useRouterState({ select: (state) => state.location.search });

  const selectedFieldSlug = useMemo(() => {
    if (typeof search === "string") {
      const params = new URLSearchParams(search);
      return params.get("field") ?? params.get("category") ?? "";
    }

    if (search && typeof search === "object") {
      const params = new URLSearchParams();
      Object.entries(search as Record<string, unknown>).forEach(([key, value]) => {
        if (value == null) return;
        if (Array.isArray(value)) {
          value.forEach((item) => params.append(key, String(item)));
        } else {
          params.set(key, String(value));
        }
      });
      return params.get("field") ?? params.get("category") ?? "";
    }

    return "";
  }, [search]);

  const selectedField = useMemo(
    () => courseFields.find((field) => field.slug === selectedFieldSlug),
    [courseFields, selectedFieldSlug],
  );

  const filteredCourses = useMemo(() => {
    if (!selectedFieldSlug) return courses;
    return courses.filter((course) => course.fieldSlug === selectedFieldSlug);
  }, [courses, selectedFieldSlug]);

  if (pathname !== "/courses") {
    return <Outlet />;
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
            Programs
          </Badge>
          <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {selectedField
              ? `${selectedField.title}${lang === "en" ? " Courses" : " cours"}`
              : t("courses.title")}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            {selectedField
              ? lang === "en"
                ? `Explore ${selectedField.title.toLowerCase()} courses designed for real-world careers and practical growth.`
                : `Découvrez les cours de ${selectedField.title.toLowerCase()} conçus pour des carrières concrètes et une montée en compétences pratique.`
              : lang === "en"
                ? "Industry-designed tracks delivered in English and French — built for the African tech ecosystem."
                : "Parcours conçus par l'industrie, dispensés en anglais et en français — adaptés à l'écosystème tech africain."}
          </p>

          {selectedField ? (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="rounded-full border border-border bg-muted/50 px-3 py-1 text-sm font-semibold text-foreground">
                {selectedField.title}
              </Badge>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/courses">{lang === "en" ? "View all programs" : "Voir tous les programmes"}</Link>
              </Button>
            </div>
          ) : null}
        </div>
      </section>

      {/* Course grid */}
      <section className="container-section py-12 sm:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((c) => (
            <Card
              key={c.id}
              className="group flex flex-col overflow-hidden rounded-xl border bg-white p-0 transition-all duration-200 card-hover"
            >
              {/* Course image */}
              <div className="relative h-52 w-full overflow-hidden">
                <CourseImage src={c.image} alt={c.title[lang]} className="h-full w-full" />
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    {c.title[lang]}
                  </h3>
                  <Badge
                    variant={c.delivery === "online" ? "default" : "secondary"}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-0.5 text-xs font-semibold",
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

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {c.desc[lang]}
                </p>

                <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                  {c.what[lang]}
                </p>

                <div className="mt-4 text-lg font-bold text-primary">
                  {formatPrice(c.basePriceUSD, currency)}
                </div>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {c.durationWeeks} {lang === "en" ? "weeks" : "semaines"} · {c.cohortSize} {lang === "en" ? "learners per cohort" : "apprenants par cohorte"}
                </p>
                <div className="mt-auto flex gap-3 pt-6">
                  <Button asChild className="flex-1 rounded-lg">
                    <Link to="/enroll/$id" params={{ id: c.id }}>{t("courses.enroll")}</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1 rounded-lg">
                    <Link to="/courses/$id" params={{ id: c.id }}>{t("courses.learn")}</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-primary py-16">
        <div className="container-section text-center">
          <h2 className="font-heading text-3xl font-extrabold text-primary-foreground sm:text-4xl">
            {lang === "en"
              ? "Ready to start your journey?"
              : "Prêt à commencer votre parcours ?"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-primary-foreground/80">
            {lang === "en"
              ? "Join a cohort of 5–10 learners and build your future in tech."
              : "Rejoignez une cohorte de 5 à 10 apprenants et construisez votre avenir dans la tech."}
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="mt-8 rounded-xl px-8 py-6 text-base font-bold shadow-sm"
          >
            <Link to="/contact">
              Apply Now <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
