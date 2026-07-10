import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { courses as seedCourses, type Course } from "@/lib/courses";

export type Lang = "en" | "fr";
export type Role = "student" | "tutor" | "admin";

export type LocalCourse = Course & {
  primaryCta?: string;
  secondaryCta?: string;
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
  tutorApplications: TutorApplication[];
  addTutorApplication: (a: Omit<TutorApplication, "id" | "status" | "assignedCohort" | "createdAt">) => void;
  updateTutorApplication: (id: string, updates: Partial<TutorApplication>) => void;
};

const Ctx = createContext<AppCtx | null>(null);

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
  const [lang, setLang] = useState<Lang>("en");
  const [role, setRole] = useState<Role>("student");
  const [courses, setCourses] = useState<LocalCourse[]>(seedCourses);
  const [tutorApplications, setTutorApplications] = useState<TutorApplication[]>([]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const addCourse = (c: LocalCourse) => setCourses((prev) => [c, ...prev]);

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
