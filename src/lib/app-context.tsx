import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { courses as seedCourses, type Course } from "@/lib/courses";
import { detectCountry, isFrenchSpeaking, type Currency } from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";

export type Lang = "en" | "fr";
export type Role = "student" | "tutor" | "admin";

export type LocalCourse = Course & {
  primaryCta?: string;
  secondaryCta?: string;
  basePriceUSD: number;
  cohortSize: number;
  outline?: string[];
};

export type Enrollment = {
  id: string;
  courseId: string;
  cohortId: string;
  studentEmail: string;
  fullName: string;
  phone: string;
  education: string;
  heardFrom: string;
  paymentOption: "full" | "partial";
  createdAt: string;
};

export type Cohort = {
  id: string;
  courseId: string;
  number: number;
  studentIds: string[]; // enrollment ids
  tutorEmail?: string;
  completed: boolean;
};

export type ChatMessage = {
  id: string;
  cohortId: string;
  authorEmail: string;
  authorName: string;
  authorRole: "student" | "tutor";
  text: string;
  createdAt: string;
};

export type PendingCertification = {
  id: string;
  cohortId: string;
  courseId: string;
  studentEnrollmentId: string;
  studentName: string;
  submittedByEmail: string;
  submittedAt: string;
};

export type Certificate = {
  id: string;
  studentEnrollmentId: string;
  studentEmail: string;
  studentName: string;
  courseId: string;
  courseName: string;
  cohortNumber: number;
  fileDataUrl?: string;
  issuedAt: string;
};

export type TutorApplication = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  specialization: string;
  bio: string;
  experience: string;
  resumeName?: string;
  resumeSize?: number;
  resumeUrl?: string;
  status: "pending" | "approved" | "rejected";
  assignedCohort: string;
  createdAt: string;
};

type AppCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  role: Role;
  setRole: (r: Role) => void;
  t: (key: string) => string;
  courses: LocalCourse[];
  addCourse: (c: LocalCourse) => void;
  updateCourse: (id: string, patch: Partial<LocalCourse>) => void;
  enrollments: Enrollment[];
  cohorts: Cohort[];
  enroll: (input: Omit<Enrollment, "id" | "cohortId" | "createdAt">) => { enrollment: Enrollment; cohort: Cohort };
  assignTutorToCohort: (cohortId: string, tutorEmail: string) => void;
  markCohortComplete: (cohortId: string) => void;
  chats: ChatMessage[];
  sendChat: (m: Omit<ChatMessage, "id" | "createdAt">) => void;
  pendingCertifications: PendingCertification[];
  submitForCertification: (entries: Omit<PendingCertification, "id" | "submittedAt">[]) => void;
  certificates: Certificate[];
  issueCertificate: (pendingId: string, fileDataUrl?: string) => void;
  country: string;
  currency: Currency;
  tutorApplications: TutorApplication[];
  addTutorApplication: (a: Omit<TutorApplication, "id" | "status" | "assignedCohort" | "createdAt">) => void;
  updateTutorApplication: (id: string, updates: Partial<TutorApplication>) => void;
};

const Ctx = createContext<AppCtx | null>(null);

// USD base prices for seed courses
const SEED_PRICES: Record<string, number> = {
  fullstack: 900,
  ai: 1200,
  ml: 1100,
  analytics: 700,
  ds: 1000,
  cyber: 950,
};

function hydrateSeed(): LocalCourse[] {
  return seedCourses.map((c) => ({
    ...c,
    basePriceUSD: SEED_PRICES[c.id] ?? 800,
    cohortSize: 8,
  }));
}

const LS = {
  courses: "serenog.courses",
  enrollments: "serenog.enrollments",
  cohorts: "serenog.cohorts",
  chats: "serenog.chats",
  pending: "serenog.pendingCerts",
  certs: "serenog.certs",
};

function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function saveLS<T>(key: string, val: T) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* noop */ }
}

const dict: Record<string, { en: string; fr: string }> = {
  "nav.home": { en: "Home", fr: "Accueil" },
  "nav.courses": { en: "Courses", fr: "Cours" },
  "nav.about": { en: "About", fr: "À propos" },
  "nav.community": { en: "Community", fr: "Communauté" },
  "nav.contact": { en: "Contact Us", fr: "Contactez-nous" },
  "nav.dashboard": { en: "Dashboard", fr: "Tableau de bord" },
  "nav.signin": { en: "Sign In", fr: "Connexion" },
  "nav.signout": { en: "Sign out", fr: "Déconnexion" },
  "nav.signedinAs": { en: "Signed in as", fr: "Connecté en tant que" },
  "nav.menu": { en: "Menu", fr: "Menu" },
  "nav.mega.softwareengineering": { en: "Software Engineering", fr: "Ingénierie Logicielle" },
  "nav.mega.ai": { en: "Artificial Intelligence", fr: "Intelligence Artificielle" },
  "nav.mega.ml": { en: "Machine Learning", fr: "Apprentissage Automatique" },
  "nav.mega.dataanalytics": { en: "Data Analytics", fr: "Analyse de Données" },
  "nav.mega.datascience": { en: "Data Science", fr: "Science des Données" },
  "nav.mega.cybersecurity": { en: "Cybersecurity", fr: "Cybersécurité" },
  "nav.mega.viewall": { en: "View All Courses", fr: "Voir tous les cours" },
  "nav.mega.about": { en: "About Us", fr: "À propos" },
  "nav.mega.leadership": { en: "Leadership", fr: "Direction" },
  "nav.mega.ourstory": { en: "Our Story", fr: "Notre histoire" },
  "nav.mega.careers": { en: "Careers", fr: "Carrières" },
  "nav.mega.contact": { en: "Contact", fr: "Contact" },
  "nav.mega.events": { en: "Events", fr: "Événements" },
  "nav.mega.blog": { en: "Blog", fr: "Blog" },
  "nav.mega.alumni": { en: "Alumni", fr: "Anciens élèves" },
  "nav.mega.scholarships": { en: "Scholarships", fr: "Bourses" },
  "nav.mega.faqs": { en: "FAQs", fr: "FAQ" },

  "auth.title.signin": { en: "Welcome back", fr: "Bon retour" },
  "auth.title.signup": { en: "Create your account", fr: "Créez votre compte" },
  "auth.subtitle.signin": { en: "Sign in to access your dashboard", fr: "Connectez-vous pour accéder à votre tableau de bord" },
  "auth.subtitle.signup": { en: "Join thousands of learners across Africa", fr: "Rejoignez des milliers d'apprenants à travers l'Afrique" },
  "auth.fullName": { en: "Full name", fr: "Nom complet" },
  "auth.email": { en: "Email", fr: "Courriel" },
  "auth.password": { en: "Password", fr: "Mot de passe" },
  "auth.submit.busy": { en: "Please wait…", fr: "Veuillez patienter…" },
  "auth.submit.signin": { en: "Sign In", fr: "Connexion" },
  "auth.submit.signup": { en: "Sign Up", fr: "Créer un compte" },
  "auth.switch.new": { en: "New to Serenog?", fr: "Nouveau sur Serenog ?" },
  "auth.switch.existing": { en: "Already have an account?", fr: "Vous avez déjà un compte ?" },
  "auth.switch.create": { en: "Create account", fr: "Créer un compte" },
  "auth.switch.signin": { en: "Sign in", fr: "Se connecter" },
  "auth.toast.accountCreated": { en: "Account created. Check your email to confirm, then sign in.", fr: "Compte créé. Vérifiez votre courriel pour confirmer, puis connectez-vous." },
  "auth.toast.welcome": { en: "Welcome back!", fr: "Bon retour !" },

  "hero.eyebrow": { en: "Bilingual Tech Education for Africa", fr: "Formation Tech Bilingue pour l'Afrique" },
  "hero.title": { en: "Master Tomorrow's Tech, in Your Language", fr: "Maîtrisez la Tech de Demain, dans Votre Langue" },
  "hero.desc": {
    en: "Industry-grade tracks in Full Stack, AI, ML, Data Analytics, Data Science and Cybersecurity — delivered in English and French, built for learners across West, Central and East Africa.",
    fr: "Des parcours professionnels en Full Stack, IA, ML, Analyse de Données, Science des Données et Cybersécurité — en anglais et en français, conçus pour les apprenants d'Afrique de l'Ouest, Centrale et de l'Est.",
  },
  "hero.cta": { en: "Get Started", fr: "Commencer" },
  "hero.cta2": { en: "Explore Courses", fr: "Voir les cours" },
  "hero.engine": { en: "Live Language Engine", fr: "Moteur Linguistique Actif" },
  "hero.enginedesc": {
    en: "Toggle EN / FR — every word on this platform switches instantly.",
    fr: "Basculez EN / FR — chaque mot de la plateforme change instantanément.",
  },

  "courses.title": { en: "Advanced Tech Tracks", fr: "Parcours Tech Avancés" },
  "courses.subtitle": { en: "Swipe through our flagship cohorts.", fr: "Découvrez nos cohortes phares." },
  "courses.enroll": { en: "Enroll Now", fr: "S'inscrire" },
  "courses.learn": { en: "Learn More", fr: "En savoir plus" },
  "courses.online": { en: "Online", fr: "En ligne" },
  "courses.physical": { en: "Physical", fr: "Présentiel" },

  "qa.title": { en: "Ask About This Track", fr: "Questions sur ce parcours" },
  "qa.subtitle": { en: "Pick a course above — answers adapt instantly.", fr: "Choisissez un cours — les réponses s'adaptent." },
  "qa.q1": { en: "What is {x}?", fr: "Qu'est-ce que {x} ?" },
  "qa.q2": { en: "What's new in the curriculum?", fr: "Quoi de neuf dans le programme ?" },
  "qa.q3": { en: "Who is this course for?", fr: "À qui s'adresse ce cours ?" },
  "qa.q4": { en: "Why study at our institution?", fr: "Pourquoi étudier chez nous ?" },

  "reviews.title": { en: "What learners say", fr: "Ce que disent les apprenants" },
  "reviews.subtitle": {
    en: "A quick look at the experience students and professionals have after joining Serenog.",
    fr: "Un aperçu de l'expérience vécue par les étudiants et professionnels après avoir rejoint Serenog.",
  },
  "reviews.signin": { en: "Sign in to leave a review", fr: "Connectez-vous pour laisser un avis" },
  "reviews.formTitle": { en: "Leave a review", fr: "Laisser un avis" },
  "reviews.formHint": {
    en: "Share what stood out for you after your first session or course.",
    fr: "Partagez ce qui vous a marqué après votre première session ou votre premier cours.",
  },
  "reviews.name": { en: "Your name", fr: "Votre nom" },
  "reviews.comment": { en: "Your review", fr: "Votre avis" },
  "reviews.submit": { en: "Submit review", fr: "Envoyer l'avis" },
  "reviews.success": {
    en: "Thanks for your review. It is now part of the community wall.",
    fr: "Merci pour votre avis. Il fait maintenant partie du mur de la communauté.",
  },
  "reviews.empty": {
    en: "Please write a short review before submitting.",
    fr: "Veuillez écrire un avis court avant de l'envoyer.",
  },
  "reviews.anonymous": { en: "Anonymous learner", fr: "Apprenant anonyme" },

  "about.title": { en: "About Us", fr: "À Propos" },
  "about.desc": {
    en: "We are a pan-African EdTech institution training the next generation of builders across Lagos, Abidjan, Douala, Dakar, Accra and Nairobi — bilingual by design, project-based by conviction.",
    fr: "Nous sommes une institution EdTech panafricaine formant la prochaine génération de bâtisseurs à Lagos, Abidjan, Douala, Dakar, Accra et Nairobi — bilingue par conception, par projet par conviction.",
  },
  "about.b1": { en: "Small cohorts of 5–10 learners", fr: "Petites cohortes de 5 à 10 apprenants" },
  "about.b2": { en: "Bilingual EN / FR delivery", fr: "Livraison bilingue EN / FR" },
  "about.b3": { en: "Pay-as-you-learn via mobile money", fr: "Paiement échelonné via mobile money" },
  "about.b4": { en: "Verifiable digital certificates", fr: "Certificats numériques vérifiables" },
  "about.mission": { en: "Mission", fr: "Mission" },
  "about.missiondesc": {
    en: "Equip one million African youth with deployable tech skills in the language they think in.",
    fr: "Doter un million de jeunes africains de compétences tech déployables dans leur langue maternelle.",
  },
  "about.vision": { en: "Vision", fr: "Vision" },
  "about.visiondesc": {
    en: "An Africa where every digital product is built and shipped from the continent.",
    fr: "Une Afrique où chaque produit numérique est conçu et déployé depuis le continent.",
  },

  "role.student": { en: "Student", fr: "Étudiant" },
  "role.tutor": { en: "Tutor", fr: "Tuteur" },
  "role.admin": { en: "Admin", fr: "Admin" },
  "role.viewas": { en: "View as", fr: "Voir en tant que" },

  "dash.overview": { en: "Overview", fr: "Aperçu" },
  "dash.classroom": { en: "Live Classroom", fr: "Classe Virtuelle" },
  "dash.async": { en: "Self-Paced Hub", fr: "Apprentissage Libre" },
  "dash.projects": { en: "Projects", fr: "Projets" },
  "dash.payments": { en: "Payments", fr: "Paiements" },
  "dash.cohorts": { en: "Cohorts", fr: "Cohortes" },
  "dash.grading": { en: "Grading & Attendance", fr: "Notation & Présence" },
  "dash.forum": { en: "Discussion Forum", fr: "Forum" },
  "dash.global": { en: "Global Overview", fr: "Vue Globale" },
  "dash.cms": { en: "Multi-Country CMS", fr: "CMS Multi-Pays" },
  "dash.crm": { en: "CRM & Leads", fr: "CRM & Prospects" },

  "footer.tagline": { en: "Bilingual tech education, built for Africa.", fr: "Formation tech bilingue, conçue pour l'Afrique." },
  "footer.rights": { en: "All rights reserved.", fr: "Tous droits réservés." },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem("serenog.lang");
      if (saved === "en" || saved === "fr") return saved;
    } catch { /* noop */ }
    return "en";
  });
  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("serenog.lang", l); localStorage.setItem("serenog.lang.explicit", "1"); } catch { /* noop */ }
  };
  const [role, setRole] = useState<Role>("student");
  const [courses, setCourses] = useState<LocalCourse[]>(() => loadLS(LS.courses, hydrateSeed()));
  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => loadLS<Enrollment[]>(LS.enrollments, []));
  const [cohorts, setCohorts] = useState<Cohort[]>(() => loadLS<Cohort[]>(LS.cohorts, []));
  const [chats, setChats] = useState<ChatMessage[]>(() => loadLS<ChatMessage[]>(LS.chats, []));
  const [pendingCertifications, setPendingCertifications] = useState<PendingCertification[]>(() => loadLS<PendingCertification[]>(LS.pending, []));
  const [certificates, setCertificates] = useState<Certificate[]>(() => loadLS<Certificate[]>(LS.certs, []));
  const [country, setCountry] = useState<string>("KE");
  const [currency, setCurrency] = useState<Currency>("KES");
  const [tutorApplications, setTutorApplications] = useState<TutorApplication[]>([]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    detectCountry().then(({ country, currency }) => {
      setCountry(country);
      setCurrency(currency);
      // Auto-switch to French for francophone countries when the user has not
      // explicitly picked a language yet.
      try {
        const explicit = localStorage.getItem("serenog.lang.explicit");
        if (!explicit && isFrenchSpeaking(country)) {
          setLangState("fr");
          localStorage.setItem("serenog.lang", "fr");
        }
      } catch { /* noop */ }
    });
  }, []);

  // Sync tutor applications from Supabase so admins see them cross-device.
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data, error } = await supabase
        .from("tutor_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error || !mounted || !data) return;
      setTutorApplications(
        data.map((r: Record<string, unknown>) => ({
          id: String(r.id),
          fullName: String(r.full_name ?? ""),
          email: String(r.email ?? ""),
          phone: String(r.phone ?? ""),
          country: String(r.country ?? ""),
          specialization: String(r.specialization ?? ""),
          bio: String(r.bio ?? ""),
          experience: String(r.experience ?? ""),
          resumeName: (r.resume_name as string) ?? undefined,
          resumeSize: (r.resume_size as number) ?? undefined,
          resumeUrl: (r.resume_url as string) ?? undefined,
          status: (r.status as TutorApplication["status"]) ?? "pending",
          assignedCohort: String(r.assigned_cohort ?? ""),
          createdAt: String(r.created_at ?? new Date().toISOString()),
        })),
      );
    };
    load();
    const channel = supabase
      .channel("tutor_applications_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "tutor_applications" }, () => load())
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(channel); };
  }, []);

  useEffect(() => { saveLS(LS.courses, courses); }, [courses]);
  useEffect(() => { saveLS(LS.enrollments, enrollments); }, [enrollments]);
  useEffect(() => { saveLS(LS.cohorts, cohorts); }, [cohorts]);
  useEffect(() => { saveLS(LS.chats, chats); }, [chats]);
  useEffect(() => { saveLS(LS.pending, pendingCertifications); }, [pendingCertifications]);
  useEffect(() => { saveLS(LS.certs, certificates); }, [certificates]);

  const addCourse = (c: LocalCourse) => setCourses((prev) => [c, ...prev]);
  const updateCourse = (id: string, patch: Partial<LocalCourse>) =>
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const enroll: AppCtx["enroll"] = (input) => {
    const course = courses.find((c) => c.id === input.courseId);
    const size = Math.min(10, Math.max(5, course?.cohortSize ?? 8));
    const courseCohorts = cohorts.filter((c) => c.courseId === input.courseId && !c.completed);
    let target = courseCohorts.find((c) => c.studentIds.length < size);
    let newCohorts = cohorts;
    if (!target) {
      target = {
        id: crypto.randomUUID(),
        courseId: input.courseId,
        number: courseCohorts.length + 1,
        studentIds: [],
        completed: false,
      };
      newCohorts = [...cohorts, target];
    }
    const enrollment: Enrollment = {
      ...input,
      id: crypto.randomUUID(),
      cohortId: target.id,
      createdAt: new Date().toISOString(),
    };
    const updatedCohort: Cohort = { ...target, studentIds: [...target.studentIds, enrollment.id] };
    newCohorts = newCohorts.map((c) => (c.id === updatedCohort.id ? updatedCohort : c));
    setCohorts(newCohorts);
    setEnrollments((prev) => [enrollment, ...prev]);
    return { enrollment, cohort: updatedCohort };
  };

  const assignTutorToCohort = (cohortId: string, tutorEmail: string) =>
    setCohorts((prev) => prev.map((c) => (c.id === cohortId ? { ...c, tutorEmail } : c)));

  const markCohortComplete = (cohortId: string) =>
    setCohorts((prev) => prev.map((c) => (c.id === cohortId ? { ...c, completed: true } : c)));

  const sendChat: AppCtx["sendChat"] = (m) =>
    setChats((prev) => [...prev, { ...m, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]);

  const submitForCertification: AppCtx["submitForCertification"] = (entries) =>
    setPendingCertifications((prev) => [
      ...entries.map((e) => ({ ...e, id: crypto.randomUUID(), submittedAt: new Date().toISOString() })),
      ...prev,
    ]);

  const issueCertificate: AppCtx["issueCertificate"] = (pendingId, fileDataUrl) => {
    const p = pendingCertifications.find((x) => x.id === pendingId);
    if (!p) return;
    const course = courses.find((c) => c.id === p.courseId);
    const cohort = cohorts.find((c) => c.id === p.cohortId);
    const enrollment = enrollments.find((e) => e.id === p.studentEnrollmentId);
    const cert: Certificate = {
      id: crypto.randomUUID(),
      studentEnrollmentId: p.studentEnrollmentId,
      studentEmail: enrollment?.studentEmail ?? "",
      studentName: p.studentName,
      courseId: p.courseId,
      courseName: course?.title.en ?? "Course",
      cohortNumber: cohort?.number ?? 1,
      fileDataUrl,
      issuedAt: new Date().toISOString(),
    };
    setCertificates((prev) => [cert, ...prev]);
    setPendingCertifications((prev) => prev.filter((x) => x.id !== pendingId));
  };

  const addTutorApplication = (a: Omit<TutorApplication, "id" | "status" | "assignedCohort" | "createdAt">) => {
    const newApp: TutorApplication = {
      ...a,
      id: crypto.randomUUID(),
      status: "pending",
      assignedCohort: "",
      createdAt: new Date().toISOString(),
    };
    setTutorApplications((prev) => [newApp, ...prev]);
  };

  const updateTutorApplication = (id: string, updates: Partial<TutorApplication>) => {
    setTutorApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, ...updates } : app)),
    );
  };

  const t = (key: string) => {
    const entry = dict[key];
    if (!entry) return key;
    return entry[lang];
  };

  return (
    <Ctx.Provider
      value={{
        lang,
        setLang,
        role,
        setRole,
        t,
        courses,
        addCourse,
        updateCourse,
        enrollments,
        cohorts,
        enroll,
        assignTutorToCohort,
        markCohortComplete,
        chats,
        sendChat,
        pendingCertifications,
        submitForCertification,
        certificates,
        issueCertificate,
        country,
        currency,
        tutorApplications,
        addTutorApplication,
        updateTutorApplication,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
