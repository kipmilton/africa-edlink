import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { courses as seedCourses, type Course } from "@/lib/courses";
import { detectCountry, getBrowserLanguage, type Currency, type PaymentProvider } from "@/lib/currency";
import {
  resolveRegionalCluster,
  type ClusterCode,
  type PreferredLanguage,
  type PreferredTimeSlot,
} from "@/lib/regional-clusters";
import { supabase } from "@/integrations/supabase/client";
import {
  COURSE_FIELD_META,
  SEED_FIELDS,
  type CourseField,
  type DifficultyLevel,
  type TargetAudience,
} from "@/lib/course-fields";

export type Lang = "en" | "fr";
export type Role = "student" | "tutor" | "admin";

export type LocalCourse = Course & {
  primaryCta?: string;
  secondaryCta?: string;
  basePriceUSD: number;
  cohortSize: number;
  durationWeeks: number;
  outline?: string[];
  fieldSlug?: string;
  stepNumber: number;
  difficultyLevel: DifficultyLevel;
  targetAudience: TargetAudience;
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
  paymentAmount?: number;
  paymentCurrency?: Currency;
  paymentStatus?: "pending" | "skipped" | "paid";
  country?: string;
  language?: Lang;
  preferredLanguage?: PreferredLanguage;
  preferredTime?: PreferredTimeSlot;
  clusterCode?: ClusterCode;
  languageCode?: Lang;
  paymentProvider?: PaymentProvider;
  createdAt: string;
};

export type Cohort = {
  id: string;
  courseId: string;
  number: number;
  clusterCode?: ClusterCode;
  languageCode?: Lang;
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
  setLang: (l: Lang, options?: { persist?: boolean }) => void;
  role: Role;
  setRole: (r: Role) => void;
  t: (key: string) => string;
  courses: LocalCourse[];
  addCourse: (c: LocalCourse) => void;
  updateCourse: (id: string, patch: Partial<LocalCourse>) => void;
  courseFields: CourseField[];
  addCourseField: (field: Omit<CourseField, "id">) => Promise<void>;
  updateCourseField: (slug: string, patch: Partial<CourseField>) => Promise<void>;
  moveCourseField: (slug: string, direction: -1 | 1) => Promise<void>;
  catalogLoading: boolean;
  moveCourseStep: (courseId: string, direction: -1 | 1) => Promise<void>;
  enrollments: Enrollment[];
  cohorts: Cohort[];
  enroll: (input: Omit<Enrollment, "id" | "cohortId" | "createdAt">) => Promise<{ enrollment: Enrollment; cohort: Cohort }>;
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

const KIDS_DEFAULT_PRICE = 300;

function metaFor(slug: string) {
  return (
    COURSE_FIELD_META[slug] ?? {
      fieldSlug: undefined as string | undefined,
      stepNumber: 1,
      difficultyLevel: "Beginner" as DifficultyLevel,
      targetAudience: "Adults" as TargetAudience,
    }
  );
}

function hydrateSeed(): LocalCourse[] {
  return seedCourses.map((c) => {
    const meta = metaFor(c.id);
    return {
      ...c,
      basePriceUSD: SEED_PRICES[c.id] ?? (meta.targetAudience === "Kids" ? KIDS_DEFAULT_PRICE : 800),
      cohortSize: 8,
      durationWeeks: meta.targetAudience === "Kids" ? 8 : 12,
      fieldSlug: meta.fieldSlug,
      stepNumber: meta.stepNumber,
      difficultyLevel: meta.difficultyLevel,
      targetAudience: meta.targetAudience,
    };
  });
}

type CourseRow = {
  slug?: string | null;
  title?: string | null;
  title_fr?: string | null;
  description?: string | null;
  description_fr?: string | null;
  delivery?: "online" | "physical" | "hybrid" | null;
  image_url?: string | null;
  what_en?: string | null;
  what_fr?: string | null;
  whatsnew_en?: string | null;
  whatsnew_fr?: string | null;
  for_en?: string | null;
  for_fr?: string | null;
  base_price_usd?: number | null;
  cohort_size?: number | null;
  duration_weeks?: number | null;
  is_published?: boolean | null;
  field_id?: string | null;
  step_number?: number | null;
  difficulty_level?: DifficultyLevel | null;
  target_age_group?: TargetAudience | null;
};

type EnrollmentRow = {
  id: string;
  course_id: string;
  cohort_id: string;
  student_email: string;
  full_name: string;
  phone?: string | null;
  education?: string | null;
  heard_from?: string | null;
  payment_option?: "full" | "partial" | null;
  payment_amount?: number | null;
  payment_currency?: Currency | null;
  payment_status?: "pending" | "skipped" | "paid" | null;
  country?: string | null;
  language?: Lang | null;
  preferred_language?: PreferredLanguage | null;
  preferred_time?: PreferredTimeSlot | null;
  cluster_code?: ClusterCode | null;
  payment_provider?: PaymentProvider | null;
  created_at?: string | null;
  language_code?: Lang | null;
};

type CohortRow = {
  id: string;
  course_id: string;
  number: number;
  cluster_code?: ClusterCode | null;
  language_code?: Lang | null;
  tutor_email?: string | null;
  completed?: boolean | null;
};

type CourseFieldRow = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  icon_name?: string | null;
  target_audience?: TargetAudience | null;
  display_order?: number | null;
  is_active?: boolean | null;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function mapCourseRow(row: CourseRow, fieldSlugById: Map<string, string>): LocalCourse | null {
  const id = row.slug?.trim();
  if (!id || !row.title) return null;
  return {
    id,
    image: row.image_url || "",
    delivery: row.delivery ?? "online",
    title: { en: row.title, fr: row.title_fr || row.title },
    desc: {
      en: row.description || "",
      fr: row.description_fr || row.description || "",
    },
    what: {
      en: row.what_en || row.description || "",
      fr: row.what_fr || row.what_en || row.description_fr || "",
    },
    whatsnew: {
      en: row.whatsnew_en || "",
      fr: row.whatsnew_fr || row.whatsnew_en || "",
    },
    for: {
      en: row.for_en || "",
      fr: row.for_fr || row.for_en || "",
    },
    basePriceUSD: Number(row.base_price_usd ?? 0),
    cohortSize: Math.min(10, Math.max(5, Number(row.cohort_size ?? 8))),
    durationWeeks: Math.max(1, Number(row.duration_weeks ?? 12)),
    fieldSlug: row.field_id ? fieldSlugById.get(row.field_id) : undefined,
    stepNumber: Math.max(1, Number(row.step_number ?? 1)),
    difficultyLevel: row.difficulty_level ?? "Beginner",
    targetAudience: row.target_age_group ?? "Adults",
  };
}

function courseToRow(
  course: LocalCourse | Partial<LocalCourse>,
  fallbackId?: string,
  fieldIdBySlug?: Map<string, string>,
): CourseRow {
  const title = course.title?.en?.trim() || "New Course";
  const fieldId = course.fieldSlug ? fieldIdBySlug?.get(course.fieldSlug) : undefined;
  return {
    slug: fallbackId ?? course.id ?? slugify(title),
    title,
    title_fr: course.title?.fr || title,
    description: course.desc?.en ?? "",
    description_fr: course.desc?.fr ?? course.desc?.en ?? "",
    delivery: course.delivery ?? "online",
    image_url: course.image ?? "",
    what_en: course.what?.en ?? "",
    what_fr: course.what?.fr ?? course.what?.en ?? "",
    whatsnew_en: course.whatsnew?.en ?? "",
    whatsnew_fr: course.whatsnew?.fr ?? course.whatsnew?.en ?? "",
    for_en: course.for?.en ?? "",
    for_fr: course.for?.fr ?? course.for?.en ?? "",
    base_price_usd: Number(course.basePriceUSD ?? 800),
    cohort_size: Math.min(10, Math.max(5, Number(course.cohortSize ?? 8))),
    duration_weeks: Math.max(1, Math.min(104, Number(course.durationWeeks ?? 12))),
    is_published: true,
    ...(fieldId ? { field_id: fieldId } : {}),
    step_number: Math.max(1, Number(course.stepNumber ?? 1)),
    difficulty_level: course.difficultyLevel ?? "Beginner",
    target_age_group: course.targetAudience ?? "Adults",
  };
}

function mapEnrollmentRow(row: EnrollmentRow): Enrollment {
  return {
    id: row.id,
    courseId: row.course_id,
    cohortId: row.cohort_id,
    studentEmail: row.student_email,
    fullName: row.full_name,
    phone: row.phone ?? "",
    education: row.education ?? "",
    heardFrom: row.heard_from ?? "",
    paymentOption: row.payment_option ?? "full",
    paymentAmount: row.payment_amount ?? undefined,
    paymentCurrency: row.payment_currency ?? undefined,
    paymentStatus: row.payment_status ?? "skipped",
    country: row.country ?? undefined,
    language: row.language ?? undefined,
    preferredLanguage: row.preferred_language ?? row.language ?? undefined,
    preferredTime: row.preferred_time ?? undefined,
    clusterCode: row.cluster_code ?? resolveRegionalCluster(row.country).code,
    languageCode: row.language_code ?? row.preferred_language ?? row.language ?? "en",
    paymentProvider: row.payment_provider ?? undefined,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
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
  "auth.switch.new": { en: "New to Serencog?", fr: "Nouveau sur Serencog ?" },
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
    en: "A quick look at the experience students and professionals have after joining Serencog.",
    fr: "Un aperçu de l'expérience vécue par les étudiants et professionnels après avoir rejoint Serencog.",
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
  // Never read browser storage during the first render — it breaks SSR hydration.
  const [lang, setLangState] = useState<Lang>("en");
  const setLang = (l: Lang, options?: { persist?: boolean }) => {
    setLangState(l);
    try {
      localStorage.setItem("serenog.lang", l);
      if (options?.persist !== false) {
        localStorage.setItem("serenog.lang.explicit", "1");
      } else {
        localStorage.removeItem("serenog.lang.explicit");
      }
    } catch { /* noop */ }
  };
  const [role, setRole] = useState<Role>("student");
  // Catalog data comes exclusively from Supabase — no local seed/mock fallback.
  const [courses, setCourses] = useState<LocalCourse[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [pendingCertifications, setPendingCertifications] = useState<PendingCertification[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [country, setCountry] = useState<string>("KE");
  const [currency, setCurrency] = useState<Currency>("KES");
  const [tutorApplications, setTutorApplications] = useState<TutorApplication[]>([]);
  const [courseFields, setCourseFields] = useState<CourseField[]>([]);

  // Hydrate locally-persisted, non-catalog state after mount (SSR-safe).
  useEffect(() => {
    setChats(loadLS<ChatMessage[]>(LS.chats, []));
    setPendingCertifications(loadLS<PendingCertification[]>(LS.pending, []));
    setCertificates(loadLS<Certificate[]>(LS.certs, []));
    const explicit = (() => { try { return localStorage.getItem("serenog.lang.explicit"); } catch { return null; } })();
    if (explicit === "1") {
      try {
        const saved = localStorage.getItem("serenog.lang");
        if (saved === "en" || saved === "fr") setLangState(saved);
      } catch { /* noop */ }
    } else {
      setLangState(getBrowserLanguage());
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    detectCountry().then(({ country, currency, profile }) => {
      setCountry(country);
      setCurrency(currency);
      try {
        const explicit = localStorage.getItem("serenog.lang.explicit");
        if (!explicit) {
          const detectedLang = profile?.language ?? getBrowserLanguage();
          setLangState(detectedLang);
          localStorage.setItem("serenog.lang", detectedLang);
          localStorage.removeItem("serenog.lang.explicit");
        }
      } catch { /* noop */ }
    });
  }, []);

  // Supabase is the launch source of truth. Local storage remains a dev/offline fallback.
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const [{ data: fieldRows }, { data: courseRows }, { data: cohortRows }, { data: enrollmentRows }] = await Promise.all([
        supabase
          .from("course_fields")
          .select("*")
          .order("display_order", { ascending: true }),
        supabase
          .from("courses")
          .select("*")
          .order("created_at", { ascending: true }),
        supabase
          .from("cohorts")
          .select("*")
          .order("created_at", { ascending: true }),
        supabase
          .from("enrollments")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (!mounted) return;

      const mappedFields = ((fieldRows ?? []) as CourseFieldRow[]).map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description ?? undefined,
        iconName: row.icon_name ?? "Shield",
        targetAudience: row.target_audience ?? "Adults",
        displayOrder: Number(row.display_order ?? 0),
        isActive: row.is_active !== false,
      }));
      setCourseFields(mappedFields);
      const activeFields = mappedFields;
      const fieldSlugById = new Map(activeFields.filter((f) => f.id).map((f) => [f.id as string, f.slug]));

      const mappedCourses = ((courseRows ?? []) as CourseRow[])
        .map((row) => mapCourseRow(row, fieldSlugById))
        .filter((course): course is LocalCourse => !!course);
      setCourses(mappedCourses);
      setCatalogLoading(false);

      const mappedEnrollments = ((enrollmentRows ?? []) as EnrollmentRow[]).map(mapEnrollmentRow);
      setEnrollments(mappedEnrollments);

      const mappedCohorts = ((cohortRows ?? []) as CohortRow[]).map((row) => ({
        id: row.id,
        courseId: row.course_id,
        number: row.number,
        clusterCode: row.cluster_code ?? undefined,
        languageCode: row.language_code ?? undefined,
        tutorEmail: row.tutor_email ?? undefined,
        completed: !!row.completed,
        studentIds: mappedEnrollments
          .filter((enrollment) => enrollment.cohortId === row.id)
          .map((enrollment) => enrollment.id),
      }));
      setCohorts(mappedCohorts);
    };

    load();
    const channel = supabase
      .channel("catalog_enrollment_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "course_fields" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "courses" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "cohorts" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "enrollments" }, () => load())
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
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

  useEffect(() => { saveLS(LS.chats, chats); }, [chats]);
  useEffect(() => { saveLS(LS.pending, pendingCertifications); }, [pendingCertifications]);
  useEffect(() => { saveLS(LS.certs, certificates); }, [certificates]);

  const addCourse = (c: LocalCourse) => {
    const fieldIdBySlug = new Map(courseFields.filter((f) => f.id).map((f) => [f.slug, f.id as string]));
    const id = c.id || slugify(c.title.en);
    const course = { ...c, id };
    setCourses((prev) => [course, ...prev]);
    void supabase.from("courses").insert(courseToRow(course, id, fieldIdBySlug));
  };

  const updateCourse = (id: string, patch: Partial<LocalCourse>) => {
    const fieldIdBySlug = new Map(courseFields.filter((f) => f.id).map((f) => [f.slug, f.id as string]));
    const current = courses.find((course) => course.id === id);
    const updated = current ? { ...current, ...patch } : { ...patch, id };
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    void supabase.from("courses").update(courseToRow(updated, id, fieldIdBySlug)).eq("slug", id);
  };

  const addCourseField: AppCtx["addCourseField"] = async (field) => {
    const slug = field.slug?.trim() || slugify(field.title);
    const nextOrder = field.displayOrder || courseFields.length + 1;
    const record = { ...field, slug, displayOrder: nextOrder, isActive: field.isActive !== false };
    setCourseFields((prev) => [...prev, record].sort((a, b) => a.displayOrder - b.displayOrder));
    const { data } = await supabase
      .from("course_fields")
      .insert({
        title: record.title,
        slug,
        description: record.description ?? "",
        icon_name: record.iconName,
        target_audience: record.targetAudience,
        display_order: nextOrder,
        is_active: record.isActive,
      })
      .select("id")
      .maybeSingle();
    if (data?.id) {
      setCourseFields((prev) => prev.map((f) => (f.slug === slug ? { ...f, id: String(data.id) } : f)));
    }
  };

  const updateCourseField: AppCtx["updateCourseField"] = async (slug, patch) => {
    setCourseFields((prev) =>
      prev.map((f) => (f.slug === slug ? { ...f, ...patch } : f)).sort((a, b) => a.displayOrder - b.displayOrder),
    );
    const row: Record<string, unknown> = {};
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.description !== undefined) row.description = patch.description;
    if (patch.iconName !== undefined) row.icon_name = patch.iconName;
    if (patch.targetAudience !== undefined) row.target_audience = patch.targetAudience;
    if (patch.displayOrder !== undefined) row.display_order = patch.displayOrder;
    if (patch.isActive !== undefined) row.is_active = patch.isActive;
    if (Object.keys(row).length === 0) return;
    await supabase.from("course_fields").update(row).eq("slug", slug);
  };

  const moveCourseField: AppCtx["moveCourseField"] = async (slug, direction) => {
    const ordered = [...courseFields].sort((a, b) => a.displayOrder - b.displayOrder);
    const index = ordered.findIndex((f) => f.slug === slug);
    const swapIndex = index + direction;
    if (index < 0 || swapIndex < 0 || swapIndex >= ordered.length) return;
    const a = ordered[index];
    const b = ordered[swapIndex];
    const reordered = ordered.map((f, i) => {
      if (i === index) return { ...a, displayOrder: swapIndex + 1 };
      if (i === swapIndex) return { ...b, displayOrder: index + 1 };
      return { ...f, displayOrder: i + 1 };
    });
    setCourseFields(reordered.sort((x, y) => x.displayOrder - y.displayOrder));
    await Promise.all(
      reordered.map((f) => supabase.from("course_fields").update({ display_order: f.displayOrder }).eq("slug", f.slug)),
    );
  };

  const moveCourseStep: AppCtx["moveCourseStep"] = async (courseId, direction) => {
    const current = courses.find((c) => c.id === courseId);
    if (!current) return;
    const siblings = courses
      .filter((c) => (c.fieldSlug ?? "") === (current.fieldSlug ?? ""))
      .sort((a, b) => a.stepNumber - b.stepNumber);
    const index = siblings.findIndex((c) => c.id === courseId);
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= siblings.length) return;
    const reordered = [...siblings];
    [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
    const withSteps = reordered.map((c, i) => ({ ...c, stepNumber: i + 1 }));
    setCourses((prev) =>
      prev.map((c) => {
        const match = withSteps.find((x) => x.id === c.id);
        return match ? { ...c, stepNumber: match.stepNumber } : c;
      }),
    );
    await Promise.all(
      withSteps.map((c) => supabase.from("courses").update({ step_number: c.stepNumber }).eq("slug", c.id)),
    );
  };

  const enroll: AppCtx["enroll"] = async (input) => {
    const course = courses.find((c) => c.id === input.courseId);
    const size = Math.min(10, Math.max(5, course?.cohortSize ?? 8));
    const clusterCode = input.clusterCode ?? resolveRegionalCluster(input.country).code;
    const languageCode: Lang = input.languageCode ?? input.preferredLanguage ?? input.language ?? "en";
    // Composite grouping key = course_id + language_code + cluster_code
    const courseCohorts = cohorts.filter(
      (c) =>
        c.courseId === input.courseId &&
        c.clusterCode === clusterCode &&
        (c.languageCode ?? "en") === languageCode &&
        !c.completed,
    );
    let target = courseCohorts.find((c) => c.studentIds.length < size);
    let newCohorts = cohorts;
    if (!target) {
      const sameKeyCount = cohorts.filter(
        (c) => c.courseId === input.courseId && c.clusterCode === clusterCode && (c.languageCode ?? "en") === languageCode,
      ).length;
      target = {
        id: crypto.randomUUID(),
        courseId: input.courseId,
        number: sameKeyCount + 1,
        clusterCode,
        languageCode,
        studentIds: [],
        completed: false,
      };
      newCohorts = [...cohorts, target];
      await supabase.from("cohorts").insert({
        id: target.id,
        course_id: target.courseId,
        number: target.number,
        cluster_code: target.clusterCode,
        language_code: languageCode,
        completed: false,
      });
    }
    const enrollment: Enrollment = {
      ...input,
      clusterCode,
      languageCode,
      id: crypto.randomUUID(),
      cohortId: target.id,
      createdAt: new Date().toISOString(),
    };
    const { error } = await supabase.from("enrollments").insert({
      id: enrollment.id,
      course_id: enrollment.courseId,
      cohort_id: enrollment.cohortId,
      student_email: enrollment.studentEmail,
      full_name: enrollment.fullName,
      phone: enrollment.phone,
      education: enrollment.education,
      heard_from: enrollment.heardFrom,
      payment_option: enrollment.paymentOption,
      payment_amount: enrollment.paymentAmount,
      payment_currency: enrollment.paymentCurrency,
      payment_status: enrollment.paymentStatus ?? "skipped",
      country: enrollment.country,
      language: enrollment.language,
      preferred_language: enrollment.preferredLanguage,
      preferred_time: enrollment.preferredTime,
      cluster_code: enrollment.clusterCode ?? clusterCode,
      language_code: languageCode,
      payment_provider: enrollment.paymentProvider,
      created_at: enrollment.createdAt,
    });
    if (error) throw new Error("We could not save your enrollment. Please try again.");
    const updatedCohort: Cohort = { ...target, studentIds: [...target.studentIds, enrollment.id] };
    newCohorts = newCohorts.map((c) => (c.id === updatedCohort.id ? updatedCohort : c));
    setCohorts(newCohorts);
    setEnrollments((prev) => [enrollment, ...prev]);
    return { enrollment, cohort: updatedCohort };
  };

  const assignTutorToCohort = (cohortId: string, tutorEmail: string) => {
    setCohorts((prev) => prev.map((c) => (c.id === cohortId ? { ...c, tutorEmail } : c)));
    void supabase.from("cohorts").update({ tutor_email: tutorEmail }).eq("id", cohortId);
  };

  const markCohortComplete = (cohortId: string) => {
    setCohorts((prev) => prev.map((c) => (c.id === cohortId ? { ...c, completed: true } : c)));
    void supabase.from("cohorts").update({ completed: true }).eq("id", cohortId);
  };

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
        catalogLoading,
        addCourse,
        updateCourse,
        courseFields,
        addCourseField,
        updateCourseField,
        moveCourseField,
        moveCourseStep,
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
