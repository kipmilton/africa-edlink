import { Link, useRouterState } from "@tanstack/react-router";
import { Globe, Menu, X, ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/use-auth";

/* ---------- Mega menu data ---------- */

function getMegaMenus(t: (key: string) => string) {
  const coursesItems = [
    { to: "/courses", label: t("nav.mega.softwareengineering") },
    { to: "/courses", label: t("nav.mega.ai") },
    { to: "/courses", label: t("nav.mega.ml") },
    { to: "/courses", label: t("nav.mega.dataanalytics") },
    { to: "/courses", label: t("nav.mega.datascience") },
    { to: "/courses", label: t("nav.mega.cybersecurity") },
    { to: "/courses", label: t("nav.mega.viewall") },
  ];

  const aboutItems = [
    { to: "/about", label: t("nav.mega.about") },
    { to: "/about", label: t("nav.mega.leadership") },
    { to: "/about", label: t("nav.mega.ourstory") },
    { to: "/careers", label: t("nav.mega.careers") },
    { to: "/contact", label: t("nav.mega.contact") },
  ];

  const communityItems = [
    { to: "/community", label: t("nav.mega.events") },
    { to: "/community", label: t("nav.mega.blog") },
    { to: "/community", label: t("nav.mega.alumni") },
    { to: "/community", label: t("nav.mega.scholarships") },
    { to: "/community", label: t("nav.mega.faqs") },
    { to: "/careers", label: t("nav.mega.careers") },
  ];

  return {
    courses: { label: t("nav.courses"), items: coursesItems },
    about: { label: t("nav.about"), items: aboutItems },
    community: { label: t("nav.community"), items: communityItems },
  };
}

type MegaMenu = {
  label: string;
  items: { to: string; label: string }[];
};

/* ---------- MegaMenu dropdown ---------- */

function Dropdown({
  menu,
  onClose,
}: {
  menu: MegaMenu;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full z-50 mt-1 w-64 animate-in fade-in slide-in-from-top-2 duration-200 rounded-xl border border-border bg-card p-2 shadow-xl"
    >
      {menu.items.map((item) => (
        <Link
          key={item.label}
          to={item.to}
          onClick={onClose}
          className={cn(
            "flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-primary/5 hover:text-primary",
            item.label === "View All Courses" && "mt-1 border-t border-border pt-3 text-primary font-semibold",
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

/* ---------- Navbar ---------- */

export function Navbar() {
  const { t, lang, setLang } = useApp();
  const { user, role, signOut } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userMenu, setUserMenu] = useState(false);
  const megaMenus = getMegaMenus(t);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground font-heading text-lg font-extrabold leading-none tracking-tight">
            S
          </div>
          <span className="font-heading text-lg font-extrabold tracking-tight text-foreground">
            Serenog
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-10 hidden flex-1 items-center gap-0.5 md:flex">
          <NavLink to="/" active={path === "/"} onClose={() => setActiveDropdown(null)}>
            {t("nav.home")}
          </NavLink>
          {Object.entries(megaMenus).map(([key, menu]) => (
            <div
              key={key}
              className="relative"
              onMouseEnter={() => setActiveDropdown(key)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                className={cn(
                  "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  activeDropdown === key
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {menu.label}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    activeDropdown === key && "rotate-180",
                  )}
                />
              </button>
              {activeDropdown === key && (
                <Dropdown
                  menu={menu}
                  onClose={() => setActiveDropdown(null)}
                />
              )}
            </div>
          ))}
          <NavLink to="/contact" active={path === "/contact"} onClose={() => setActiveDropdown(null)}>
            {t("nav.contact")}
          </NavLink>
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {/* Language toggle */}
          <div className="hidden items-center rounded-full border border-border bg-muted/60 p-0.5 sm:flex">
            <button
              onClick={() => setLang("en")}
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-all",
                lang === "en"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Globe className="h-3 w-3" /> EN
            </button>
            <button
              onClick={() => setLang("fr")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold transition-all",
                lang === "fr"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              FR
            </button>
          </div>
          {user ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setUserMenu((o) => !o)}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted"
              >
                <div className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {(user.email ?? "?")[0].toUpperCase()}
                </div>
                <span className="max-w-30 truncate">{user.email}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {userMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-xl">
                  <div className="border-b border-border px-3 pb-2 text-xs text-muted-foreground">
                    {t("nav.signedinAs")} <span className="font-semibold text-foreground">{t(`role.${role ?? "student"}`)}</span>
                  </div>
                  <Link to="/dashboard" onClick={() => setUserMenu(false)} className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted">
                    <UserIcon className="h-4 w-4" /> {t("nav.dashboard")}
                  </Link>
                  <button
                    onClick={async () => { setUserMenu(false); await signOut(); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" /> {t("nav.signout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button asChild size="sm" className="hidden sm:inline-flex rounded-lg">
              <Link to="/auth">{t("nav.signin")}</Link>
            </Button>
          )}
          <button
            className="md:hidden"
            onClick={() => { setOpen((o) => !o); setActiveDropdown(null); }}
            aria-label={t("nav.menu")}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-white md:hidden animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-1 px-4 pb-6 pt-3">
            <MobileNavLink to="/" onClick={() => setOpen(false)}>
              {t("nav.home")}
            </MobileNavLink>
            <MobileSection label={t("nav.courses")} items={megaMenus.courses.items} onClick={() => setOpen(false)} />
            <MobileSection label={t("nav.about")} items={megaMenus.about.items} onClick={() => setOpen(false)} />
            <MobileSection label={t("nav.community")} items={megaMenus.community.items} onClick={() => setOpen(false)} />
            <MobileNavLink to="/contact" onClick={() => setOpen(false)}>
              {t("nav.contact")}
            </MobileNavLink>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="mt-3 flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
                  {t("nav.dashboard")}
                </Link>
                <button
                  onClick={async () => { setOpen(false); await signOut(); }}
                  className="mt-2 flex items-center justify-center rounded-lg border border-destructive/40 px-4 py-2.5 text-sm font-bold text-destructive"
                >
                  {t("nav.signout")}
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="mt-3 flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
                {t("nav.signin")}
              </Link>
            )}
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setLang("en")}
                className={cn(
                  "rounded-full px-5 py-1.5 text-xs font-bold transition-all",
                  lang === "en" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground",
                )}
              >
                EN
              </button>
              <button
                onClick={() => setLang("fr")}
                className={cn(
                  "rounded-full px-5 py-1.5 text-xs font-bold transition-all",
                  lang === "fr" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground",
                )}
              >
                FR
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------- Helpers ---------- */

function NavLink({
  to,
  active,
  onClose,
  children,
}: {
  to: string;
  active: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onClose}
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  to,
  onClick,
  children,
}: {
  to: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
    >
      {children}
    </Link>
  );
}

function MobileSection({
  label,
  items,
  onClick,
}: {
  label: string;
  items: { to: string; label: string }[];
  onClick: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        {label}
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            expanded && "rotate-180",
          )}
        />
      </button>
      {expanded && (
        <div className="ml-3 border-l border-border pl-3 animate-in slide-in-from-left-2 duration-150">
          {items.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={onClick}
              className={cn(
                "flex rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                item.label === "View All Courses" && "mt-1 border-t border-border pt-2.5 text-primary font-semibold",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
