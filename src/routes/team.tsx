import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { TeamGrid } from "@/components/site/TeamGrid";
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Our Team — Serencog Technologies" },
      {
        name: "description",
        content:
          "Meet the management team and tutors behind Serencog Technologies, the bilingual tech academy for East, Central and West Africa.",
      },
      { property: "og:title", content: "Our Team — Serencog Technologies" },
      {
        property: "og:description",
        content: "The people leading and teaching at Serencog Technologies across Africa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const { lang } = useApp();
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-white py-16">
        <div className="container-section">
          <Badge variant="secondary" className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {lang === "fr" ? "Notre équipe" : "Our Team"}
          </Badge>
          <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {lang === "fr" ? "Les personnes derrière Serencog" : "The people behind Serencog"}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {lang === "fr"
              ? "Notre équipe de direction et nos formateurs bilingues accompagnent chaque cohorte de l'inscription à la certification."
              : "Our management team and bilingual tutors guide every cohort from enrollment to certification."}
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container-section space-y-12">
          <div>
            <h2 className="font-heading text-2xl font-extrabold text-foreground">
              {lang === "fr" ? "Équipe de direction" : "Management team"}
            </h2>
            <div className="mt-6">
              <TeamGrid kind="management" />
            </div>
          </div>
          <div>
            <h2 className="font-heading text-2xl font-extrabold text-foreground">
              {lang === "fr" ? "Nos formateurs" : "Our tutors"}
            </h2>
            <div className="mt-6">
              <TeamGrid kind="tutor" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
