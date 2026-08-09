export type TargetAudience = "Adults" | "Kids";
export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export type CourseField = {
  id?: string;
  slug: string;
  title: string;
  titleFr?: string;
  description?: string;
  image?: string;
  features?: string[];
  iconName: string;
  targetAudience: TargetAudience;
  displayOrder: number;
  isActive: boolean;
};

/** Fallback catalog structure used before/without Supabase `course_fields` rows. */
export const SEED_FIELDS: CourseField[] = [
  {
    slug: "data-science-analytics",
    title: "Data Science & Analytics",
    titleFr: "Science des Données & Analyse",
    description: "From spreadsheets to production analytics and modelling.",
    image: "",
    features: ["Analytics", "Dashboard Design", "Career Growth"],
    iconName: "BarChart3",
    targetAudience: "Adults",
    displayOrder: 1,
    isActive: true,
  },
  {
    slug: "cybersecurity-forensics",
    title: "Cybersecurity & Digital Forensics",
    titleFr: "Cybersécurité & Investigation Numérique",
    description: "Defend, detect and investigate — SOC, forensics and ethical hacking.",
    iconName: "Shield",
    targetAudience: "Adults",
    displayOrder: 2,
    isActive: true,
  },
  {
    slug: "fullstack-web",
    title: "Full-Stack Web Development",
    titleFr: "Développement Web Full-Stack",
    description: "Ship real products end-to-end with modern web stacks.",
    iconName: "Code2",
    targetAudience: "Adults",
    displayOrder: 3,
    isActive: true,
  },
  {
    slug: "ai-machine-learning",
    title: "AI & Machine Learning",
    titleFr: "IA & Apprentissage Automatique",
    description: "Applied AI, LLM agents and machine learning engineering.",
    iconName: "Brain",
    targetAudience: "Adults",
    displayOrder: 4,
    isActive: true,
  },
  {
    slug: "kids-tech-bootcamp",
    title: "Kids Tech Bootcamp 🚀",
    titleFr: "Bootcamp Tech Enfants 🚀",
    description: "Ages 7–17: coding, robotics, AI and online safety.",
    iconName: "Rocket",
    targetAudience: "Kids",
    displayOrder: 5,
    isActive: true,
  },
];

export type CourseFieldMeta = {
  fieldSlug: string;
  stepNumber: number;
  difficultyLevel: DifficultyLevel;
  targetAudience: TargetAudience;
};

/** Default field / sequence metadata by course slug (used when the DB has no value yet). */
export const COURSE_FIELD_META: Record<string, CourseFieldMeta> = {
  analytics: { fieldSlug: "data-science-analytics", stepNumber: 1, difficultyLevel: "Beginner", targetAudience: "Adults" },
  ds: { fieldSlug: "data-science-analytics", stepNumber: 2, difficultyLevel: "Intermediate", targetAudience: "Adults" },
  cyber: { fieldSlug: "cybersecurity-forensics", stepNumber: 1, difficultyLevel: "Beginner", targetAudience: "Adults" },
  "ethical-hacking": { fieldSlug: "cybersecurity-forensics", stepNumber: 2, difficultyLevel: "Intermediate", targetAudience: "Adults" },
  "soc-analysis": { fieldSlug: "cybersecurity-forensics", stepNumber: 3, difficultyLevel: "Advanced", targetAudience: "Adults" },
  "digital-forensics": { fieldSlug: "cybersecurity-forensics", stepNumber: 4, difficultyLevel: "Expert", targetAudience: "Adults" },
  fullstack: { fieldSlug: "fullstack-web", stepNumber: 1, difficultyLevel: "Beginner", targetAudience: "Adults" },
  ml: { fieldSlug: "ai-machine-learning", stepNumber: 1, difficultyLevel: "Intermediate", targetAudience: "Adults" },
  ai: { fieldSlug: "ai-machine-learning", stepNumber: 2, difficultyLevel: "Advanced", targetAudience: "Adults" },
  "kids-coding-game-dev": { fieldSlug: "kids-tech-bootcamp", stepNumber: 1, difficultyLevel: "Beginner", targetAudience: "Kids" },
  "kids-ai-robotics": { fieldSlug: "kids-tech-bootcamp", stepNumber: 2, difficultyLevel: "Intermediate", targetAudience: "Kids" },
  "kids-cyber-safety": { fieldSlug: "kids-tech-bootcamp", stepNumber: 3, difficultyLevel: "Beginner", targetAudience: "Kids" },
};

export const DIFFICULTY_LEVELS: DifficultyLevel[] = ["Beginner", "Intermediate", "Advanced", "Expert"];

export function stepBadge(stepNumber: number, difficulty: DifficultyLevel): string {
  return `STEP ${stepNumber} · ${difficulty.toUpperCase()}`;
}