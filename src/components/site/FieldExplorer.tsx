import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Brain,
  Code2,
  Rocket,
  Shield,
  GraduationCap,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/lib/app-context";
import { formatPrice } from "@/lib/currency";
import { stepBadge } from "@/lib/course-fields";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  BarChart3,
  Brain,
  Code2,
  Rocket,
  Shield,
  GraduationCap,
};

export function FieldExplorer() {
  const { courseFields, courses, currency, lang } = useApp();
  const fields = useMemo(
    () => courseFields.filter((f) => f.isActive).sort((a, b) => a.displayOrder - b.displayOrder),
    [courseFields],
  );
  const [activeSlug, setActiveSlug] = useState<string>(fields[0]?.slug ?? "");
  const active = fields.find((f) => f.slug === activeSlug) ?? fields[0];

  const fieldCourses = useMemo(
    () =>
      courses
        .filter((c) => c.fieldSlug === active?.slug)
        .sort((a, b) => a.stepNumber - b.stepNumber),
    [courses, active?.slug],
  );

  if (fields.length === 0) return null;

  return (
    <section className="border-y border-border bg-white py-16 sm:py-20">
      <div className="container-section">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            {lang === "en" ? "Explore career paths" : "Explorez les parcours"}
          </p>
          <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {lang === "en" ? "Pick a field, follow the steps" : "Choisissez un domaine, suivez les étapes"}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {lang === "en"
              ? "Every field is a sequenced path — start at Step 1 and progress to advanced specialisation."
              : "Chaque domaine est un parcours séquencé — commencez à l'étape 1 et progressez vers la spécialisation avancée."}
          </p>
        </div>

        {/* Pill tabs */}
        <div
          role="tablist"
          aria-label={lang === "en" ? "Course fields" : "Domaines de cours"}
          className="mt-8 flex gap-2 overflow-x-auto pb-2"
        >
          {fields.map((field) => {
            const Icon = ICONS[field.iconName] ?? Shield;
            const isActive = field.slug === active?.slug;
            return (
              <button
                key={field.slug}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setActiveSlug(field.slug)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-foreground hover:bg-secondary/70",
                )}
              >
                <Icon className="h-4 w-4" />
                {field.title}
              </button>
            );
          })}
        </div>

        {/* Course grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {fieldCourses.length === 0 && (
            <Card className="p-8 text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
              {lang === "en"
                ? "Courses for this field are being published. Check back shortly."
                : "Les cours de ce domaine sont en cours de publication. Revenez bientôt."}
            </Card>
          )}
          {fieldCourses.map((course) => (
            <Card key={course.id} className="flex flex-col overflow-hidden p-0">
              <div className="relative h-40 w-full overflow-hidden bg-secondary">
                {course.image ? (
                  <img src={course.image} alt={course.title[lang]} loading="lazy" className="h-full w-full object-cover" />
                ) : null}
                <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary-foreground">
                  {stepBadge(course.stepNumber, course.difficultyLevel)}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-heading text-base font-bold text-foreground">{course.title[lang]}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{course.desc[lang]}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-foreground">
                    {course.durationWeeks} {lang === "en" ? "weeks" : "semaines"}
                  </span>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-foreground">
                    {course.targetAudience === "Kids" ? (lang === "en" ? "Ages 7–17" : "7–17 ans") : lang === "en" ? "Adults" : "Adultes"}
                  </span>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-primary">
                    {formatPrice(course.basePriceUSD, currency)}
                  </span>
                </div>
                <div className="mt-auto flex gap-2 pt-5">
                  <Button asChild variant="outline" className="flex-1">
                    <Link to="/courses/$id" params={{ id: course.id }}>
                      {lang === "en" ? "View Details" : "Voir les détails"}
                    </Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link to="/enroll/$id" params={{ id: course.id }}>
                      {lang === "en" ? "Enroll Now" : "S'inscrire"}
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}