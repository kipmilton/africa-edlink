import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/app-context";
import { MessageSquare, Users, Calendar, MapPin, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — Afritech Academy" },
      {
        name: "description",
        content: "Join our pan-African alumni network, events, and cohort communities.",
      },
      {
        property: "og:title",
        content: "Community — Afritech Academy",
      },
      {
        property: "og:description",
        content: "Meetups, hackathons, and alumni across 6 countries.",
      },
    ],
  }),
  component: CommunityPage,
});

/* ---------- Placeholder image ---------- */

function CommunityPlaceholder() {
  return (
    <div className="aspect-[3/2] w-full rounded-xl bg-gradient-to-br from-primary/5 via-background to-accent/5 grid place-items-center">
      <GraduationCap className="h-12 w-12 text-primary/30" />
    </div>
  );
}

/* ---------- Page ---------- */

function CommunityPage() {
  const { lang } = useApp();
  const T = (en: string, fr: string) => (lang === "en" ? en : fr);

  return (
    <div className="bg-background">
      {/* Header */}
      <section className="border-b border-border bg-white">
        <div className="container-section py-16 sm:py-20">
          <Badge
            variant="secondary"
            className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Community
          </Badge>
          <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {T("Community", "Communauté")}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            {T(
              "Builders across West, Central and East Africa — events, channels and alumni hiring.",
              "Bâtisseurs en Afrique de l'Ouest, Centrale et de l'Est — événements, canaux et alumni qui recrutent.",
            )}
          </p>
        </div>
      </section>

      {/* Stats — all 0 as required */}
      <section className="container-section -mt-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: T("Active members", "Membres actifs"), value: "0", icon: Users },
            { label: T("Channels", "Canaux"), value: "0", icon: MessageSquare },
            { label: T("Events this month", "Événements ce mois"), value: "0", icon: Calendar },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Card
                key={s.label}
                className="rounded-xl border bg-white p-6 text-center shadow-sm"
              >
                <Icon className="mx-auto h-5 w-5 text-primary/60" />
                <p className="mt-2 font-heading text-4xl font-extrabold text-primary">
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Upcoming events */}
      <section className="container-section py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              {T("Upcoming events", "Événements à venir")}
            </h2>
            <p className="mt-1 text-muted-foreground">
              {T("Regular meetups across our hub cities.", "Rencontres régulières dans nos villes hubs.")}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => {
            const cities = [
              "Lagos, NG",
              "Abidjan, CI",
              "Nairobi, KE",
              "Dakar, SN",
              "Douala, CM",
              "Accra, GH",
            ];
            const titles = [
              "Frontend Meetup",
              "AI Builders Salon",
              "Cyber CTF Night",
              "Data4Good Hackathon",
              "Career Fair",
              "Founder Office Hours",
            ];
            return (
              <Card
                key={i}
                className="rounded-xl border bg-white p-6 shadow-sm card-hover"
              >
                <Badge
                  variant="secondary"
                  className="rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium"
                >
                  <MapPin className="mr-1 h-3 w-3 text-accent" />
                  {cities[i]}
                </Badge>
                <h3 className="mt-4 font-heading text-lg font-bold text-foreground">
                  {titles[i]}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {T("Date coming soon", "Date à venir")}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Image placeholder */}
      <section className="border-t border-border bg-white">
        <div className="container-section py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                {T("Join the network", "Rejoignez le réseau")}
              </h2>
              <p className="mt-3 text-muted-foreground">
                {T(
                  "Our community spans 6 countries with active WhatsApp groups per cohort, regular tech events, and an alumni network that hires from within.",
                  "Notre communauté couvre 6 pays avec des groupes WhatsApp actifs par cohorte, des événements tech réguliers et un réseau d'anciens qui recrute en interne.",
                )}
              </p>
            </div>
            <CommunityPlaceholder />
          </div>
        </div>
      </section>
    </div>
  );
}
