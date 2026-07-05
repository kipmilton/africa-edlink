import { Link } from "@tanstack/react-router";
import { useApp } from "@/lib/app-context";

export function Footer() {
  const { t } = useApp();
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex shrink-0 items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground font-heading text-lg font-extrabold leading-none tracking-tight">
                A
              </div>
              <span className="font-heading text-lg font-extrabold tracking-tight text-foreground">
                Afritech<span className="text-accent">.</span>Academy
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t("footer.tagline")}
            </p>
            <p className="mt-6 text-xs text-muted-foreground">
              Lagos · Abidjan · Douala · Dakar · Accra · Nairobi
            </p>
          </div>

          {/* Courses */}
          <div>
            <h4 className="font-heading text-sm font-bold text-foreground">Courses</h4>
            <ul className="mt-4 space-y-3">
              {["Software Engineering", "Artificial Intelligence", "Machine Learning", "Data Science", "Cybersecurity"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      to="/courses"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading text-sm font-bold text-foreground">Company</h4>
            <ul className="mt-4 space-y-3">
              {[
                { to: "/about", label: "About Us" },
                { to: "/about", label: "Our Story" },
                { to: "/community", label: "Careers" },
                { to: "/community", label: "Alumni" },
                { to: "/community", label: "Scholarships" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-sm font-bold text-foreground">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="transition-colors hover:text-foreground">
                <a href="mailto:hello@afritech.academy">hello@afritech.academy</a>
              </li>
              <li className="transition-colors hover:text-foreground">
                <a href="tel:+2250700000000">+225 07 00 00 00 00</a>
              </li>
              <li className="pt-2">
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  WhatsApp Community
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © 2026 Afritech Academy. {t("footer.rights")}
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <a href="#" className="transition-colors hover:text-foreground">Privacy Policy</a>
            <a href="#" className="transition-colors hover:text-foreground">Terms of Service</a>
            <a href="#" className="transition-colors hover:text-foreground">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
