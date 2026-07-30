import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.jpeg";
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
              <img
                src={logo}
                alt="Serencog Technologies logo"
                className="h-10 w-auto max-w-[8rem] rounded-lg object-contain"
              />
              <span className="font-heading text-lg font-extrabold tracking-tight text-foreground">
                Serencog
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
                { to: "/careers", label: "Careers" },
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
                <a href="mailto:hello@serencog.com">hello@serencog.com</a>
              </li>
              <li className="transition-colors hover:text-foreground">
                <a href="tel:+2250700000000">+254 700 00 00 00</a>
              </li>
              <li className="pt-2">
                <a
                  href="https://wa.me/225700000000"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M21.7 2.3a11 11 0 1 0-15.6 15.6L2 22l3.1-1.1A11 11 0 0 0 21.7 2.3z" />
                    <path d="M17.4 14.3c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-1 1.1-.2.2-.4.3-.7.1-.8-.4-2.6-1.5-3.5-2.2-.6-.5-.6-.9-.1-1.2.6-.3 1.1-.8 1.3-1.1.2-.3.1-.5 0-.7-.1-.2-.7-1.7-1-2.3-.3-.6-.6-.5-.8-.5-.2 0-.5 0-.8 0-.3 0-.7.1-1 .5-.3.4-1 1.1-1 2.7 0 1.6 1 3.1 1.1 3.3.2.3 1.9 3.1 4.6 4.2 3 .1 3.3-1.3 3.6-1.4.3-.1.9-.3 1-.6.1-.3.1-.6.1-.7 0-.1-.1-.2-.4-.4z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © 2026 Serencog Technologies. {t("footer.rights")}
          </p>

          <a
            href="https://www.linkedin.com/in/milton-kiprop-b1620a237"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Built by Milton Kiprop
          </a>

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
