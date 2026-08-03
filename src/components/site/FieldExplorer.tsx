import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import useEmblaCarousel from "embla-carousel-react";
import {
  BarChart3,
  Brain,
  Code2,
  Rocket,
  Shield,
  GraduationCap,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/lib/app-context";
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

type FieldVisual = {
  image: string;
  accent: string;
  chips: string[];
  descriptionEn: string;
  descriptionFr: string;
};

const FIELD_VISUALS: Record<string, FieldVisual> = {
  "data-science-analytics": {
    image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1400&q=80",
    accent: "from-sky-700/35 via-cyan-500/20 to-transparent",
    chips: ["Analytics", "Dashboard Design", "Career Growth"],
    descriptionEn: "Learn to uncover trends, build decision-ready dashboards, and turn complex data into business impact.",
    descriptionFr: "Apprenez à découvrir des tendances, à créer des tableaux de bord utiles aux décisions et à transformer les données complexes en impact métier.",
  },
  "cybersecurity-forensics": {
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1400&q=80",
    accent: "from-violet-700/35 via-fuchsia-500/20 to-transparent",
    chips: ["Threat Detection", "SOC Skills", "High Demand"],
    descriptionEn: "Master security operations, incident response, and digital investigation to protect modern organizations.",
    descriptionFr: "Maîtrisez les opérations de sécurité, l'intervention en cas d'incident et l'investigation numérique pour protéger les organisations modernes.",
  },
  "fullstack-web": {
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    accent: "from-emerald-700/35 via-teal-500/20 to-transparent",
    chips: ["Full-Stack", "Real Products", "Deployment"],
    descriptionEn: "Build complete digital products from user interfaces to backend systems with modern development workflows.",
    descriptionFr: "Construisez des produits numériques complets, des interfaces utilisateur aux systèmes back-end, avec des workflows de développement modernes.",
  },
  "ai-machine-learning": {
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=80",
    accent: "from-amber-700/35 via-orange-500/20 to-transparent",
    chips: ["Applied AI", "Automation", "Future Skills"],
    descriptionEn: "Explore machine learning, intelligent automation, and practical AI systems that solve real business challenges.",
    descriptionFr: "Explorez l'apprentissage automatique, l'automatisation intelligente et les systèmes d'IA pratiques qui résolvent de vrais défis métier.",
  },
  "kids-tech-bootcamp": {
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=80",
    accent: "from-rose-700/35 via-pink-500/20 to-transparent",
    chips: ["Creative", "Fun Learning", "Future Ready"],
    descriptionEn: "Inspire young learners through coding, robotics, AI, and digital safety in a playful and guided environment.",
    descriptionFr: "Inspirez les jeunes apprenants grâce au codage, à la robotique, à l'IA et à la sécurité numérique dans un environnement ludique et guidé.",
  },
};

export function FieldExplorer() {
  const { courseFields, lang } = useApp();
  const fields = useMemo(
    () => courseFields.filter((f) => f.isActive).sort((a, b) => a.displayOrder - b.displayOrder),
    [courseFields],
  );
  const [activeSlug, setActiveSlug] = useState<string>(fields[0]?.slug ?? "");
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start", containScroll: "trimSnaps" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const autoplay = window.setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    return () => window.clearInterval(autoplay);
  }, [emblaApi]);

  useEffect(() => {
    if (!fields.length) return;
    if (!activeSlug) setActiveSlug(fields[0].slug);
  }, [activeSlug, fields]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  if (fields.length === 0) return null;

  return (
    <section className="border-y border-border bg-linear-to-b from-white via-slate-50 to-white py-20 sm:py-24">
      <div className="container-section">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">
            {lang === "en" ? "Explore Specializations" : "Découvrez les spécialisations"}
          </p>
          <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {lang === "en" ? "Choose a field and start learning with purpose" : "Choisissez un domaine et apprenez avec intention"}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {lang === "en"
              ? "Discover industry-aligned programs designed to move you from curiosity to career-ready skills."
              : "Découvrez des programmes alignés sur l'industrie conçus pour vous faire passer de la curiosité à des compétences prêtes à l'emploi."}
          </p>
        </div>

        <div className="relative mt-10">
          <button
            type="button"
            aria-label={lang === "en" ? "Scroll left" : "Défiler à gauche"}
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/90 shadow-lg backdrop-blur md:flex"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>

          <div ref={emblaRef} className="overflow-hidden px-1 md:px-10">
            <div className="flex">
              {fields.map((field) => {
                const Icon = ICONS[field.iconName] ?? Shield;
                const visual = FIELD_VISUALS[field.slug] ?? FIELD_VISUALS["fullstack-web"];
                const isActive = field.slug === activeSlug;
                return (
                  <div key={field.slug} className="min-w-0 flex-[0_0_100%] px-2 md:flex-[0_0_50%] lg:flex-[0_0_calc(100%/3)]">
                    <Card
                      className={cn(
                        "group h-full overflow-hidden border border-white/70 bg-white/80 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(15,23,42,0.14)]",
                        isActive && "ring-2 ring-primary/20",
                      )}
                    >
                      <div className="relative h-52 overflow-hidden">
                        <img src={visual.image} alt={field.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                        <div className={cn("absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-950/20 to-transparent", visual.accent)} />
                        <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white backdrop-blur">
                          {lang === "en" ? "Specialization" : "Spécialisation"}
                        </div>
                        <div className="absolute bottom-4 left-4 rounded-2xl border border-white/30 bg-white/90 p-2 shadow-sm backdrop-blur">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>

                      <div className="flex h-[calc(100%-13rem)] flex-col p-6">
                        <h3 className="font-heading text-xl font-bold text-foreground">{field.title}</h3>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          {lang === "en" ? visual.descriptionEn : visual.descriptionFr}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {visual.chips.map((chip) => (
                            <span key={chip} className="rounded-full border border-border/70 bg-slate-50/90 px-3 py-1 text-xs font-semibold text-foreground/80">
                              {chip}
                            </span>
                          ))}
                        </div>

                        <div className="mt-auto pt-6">
                          <Button
                            asChild
                            size="lg"
                            className="w-full rounded-xl px-5 py-6 text-sm font-semibold shadow-sm"
                            onClick={() => setActiveSlug(field.slug)}
                          >
                            <Link to="/courses" search={{ field: field.slug }}>
                              {lang === "en" ? "Learn More" : "En savoir plus"}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            aria-label={lang === "en" ? "Scroll right" : "Défiler à droite"}
            onClick={scrollNext}
            className="absolute right-0 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/90 shadow-lg backdrop-blur md:flex"
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {fields.map((field, index) => (
            <button
              key={field.slug}
              type="button"
              aria-label={lang === "en" ? `Go to slide ${index + 1}` : `Aller à la diapositive ${index + 1}`}
              onClick={() => emblaApi?.scrollTo(index)}
              className={cn(
                "h-2.5 rounded-full transition-all",
                index === selectedIndex ? "w-8 bg-primary" : "w-2.5 bg-muted-foreground/30",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
