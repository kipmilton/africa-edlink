import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/app-context";
import { Mail, Phone, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Serenog" },
      {
        name: "description",
        content: "Talk to admissions, partnerships, or our regional teams across Africa.",
      },
      {
        property: "og:title",
        content: "Contact Serenog",
      },
      {
        property: "og:description",
        content: "Reach our team in EN or FR.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
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
            Contact
          </Badge>
          <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {T("Contact Us", "Contactez-nous")}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            {T("We reply in under 24h, in your language.", "Nous répondons en moins de 24h, dans votre langue.")}
          </p>
        </div>
      </section>

      {/* Form + Info */}
      <section className="container-section py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          {/* Form */}
          <Card className="rounded-xl border bg-white p-8 shadow-sm">
            <form
              className="grid gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success(T("Message sent — talk soon!", "Message envoyé — à bientôt !"));
                (e.target as HTMLFormElement).reset();
              }}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    {T("Full name", "Nom complet")}
                  </Label>
                  <Input id="name" required placeholder="Aminata Diallo" className="rounded-lg" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input id="email" required type="email" placeholder="you@email.com" className="rounded-lg" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country" className="text-sm font-medium">
                  {T("Country", "Pays")}
                </Label>
                <Input id="country" placeholder="Côte d'Ivoire" className="rounded-lg" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message" className="text-sm font-medium">
                  {T("Message", "Message")}
                </Label>
                <Textarea id="message" className="min-h-[140px] rounded-lg" rows={6} required />
              </div>
              <Button
                size="lg"
                type="submit"
                className="w-fit rounded-xl px-8 py-6 text-base font-bold shadow-sm"
              >
                {T("Send message", "Envoyer")}
              </Button>
            </form>
          </Card>

          {/* Contact info */}
          <div className="grid gap-4">
            <Card className="rounded-xl border bg-white p-6 shadow-sm card-hover">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-bold text-foreground">Email</p>
              <p className="mt-1 text-sm text-muted-foreground">hello@serenog.com</p>
            </Card>
            <Card className="rounded-xl border bg-white p-6 shadow-sm card-hover">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Phone className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-bold text-foreground">
                {T("Phone", "Téléphone")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">+225 07 00 00 00 00</p>
            </Card>
            <Card className="rounded-xl border bg-white p-6 shadow-sm card-hover">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10 text-accent">
                <MessageCircle className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-bold text-foreground">WhatsApp</p>
              <p className="mt-1 text-sm text-muted-foreground">+234 901 234 5678</p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
