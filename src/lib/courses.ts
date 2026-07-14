import fullstackImg from "@/assets/course-fullstack.jpg";
import aiImg from "@/assets/course-ai.jpg";
import mlImg from "@/assets/course-ml.jpg";
import analyticsImg from "@/assets/course-analytics.jpg";
import dsImg from "@/assets/course-ds.jpg";
import cyberImg from "@/assets/course-cyber.jpg";

export type Course = {
  id: string;
  image: string;
  delivery: "online" | "physical" | "hybrid";
  title: { en: string; fr: string };
  desc: { en: string; fr: string };
  for: { en: string; fr: string };
  whatsnew: { en: string; fr: string };
  what: { en: string; fr: string };
};

export const courses: Course[] = [
  {
    id: "fullstack",
    image: fullstackImg,
    delivery: "online",
    title: { en: "Full Stack Development", fr: "Développement Full Stack" },
    desc: {
      en: "Build production-ready web apps end-to-end with React, Node and PostgreSQL.",
      fr: "Créez des applications web complètes avec React, Node et PostgreSQL.",
    },
    what: {
      en: "Full Stack engineering is the craft of building both the user-facing interface and the server, database and APIs that power it.",
      fr: "L'ingénierie Full Stack consiste à construire à la fois l'interface utilisateur et le serveur, la base de données et les APIs qui l'alimentent.",
    },
    whatsnew: {
      en: "Now includes TanStack Start, Server Components and edge deployment to Cloudflare.",
      fr: "Inclut désormais TanStack Start, les Server Components et le déploiement edge sur Cloudflare.",
    },
    for: {
      en: "Aspiring software engineers, bootcamp graduates, and self-taught coders aiming for their first dev role.",
      fr: "Futurs ingénieurs logiciels, diplômés de bootcamp et autodidactes visant un premier poste de développeur.",
    },
  },
  {
    id: "ai",
    image: aiImg,
    delivery: "online",
    title: { en: "Artificial Intelligence", fr: "Intelligence Artificielle" },
    desc: { en: "From transformers to LLM agents — ship AI products that work.", fr: "Des transformeurs aux agents LLM — livrez des produits IA qui fonctionnent." },
    what: { en: "AI is the discipline of building systems that perceive, reason and act on data the way humans would.", fr: "L'IA est la discipline de construction de systèmes qui perçoivent, raisonnent et agissent comme des humains." },
    whatsnew: { en: "Updated with multimodal models, retrieval-augmented generation and agentic workflows.", fr: "Mis à jour avec les modèles multimodaux, RAG et les workflows agentiques." },
    for: { en: "Developers, researchers and product builders ready to integrate AI into real apps.", fr: "Développeurs, chercheurs et créateurs prêts à intégrer l'IA dans de vraies apps." },
  },
  {
    id: "ml",
    image: mlImg,
    delivery: "physical",
    title: { en: "Machine Learning", fr: "Apprentissage Automatique" },
    desc: { en: "Master regression, classification, and modern deep learning pipelines.", fr: "Maîtrisez la régression, la classification et le deep learning moderne." },
    what: { en: "Machine Learning is teaching computers to find patterns and make predictions without being explicitly programmed.", fr: "Le ML consiste à apprendre aux machines à trouver des motifs et à prédire sans être explicitement programmées." },
    whatsnew: { en: "Hands-on MLOps tracks with Vertex AI and Hugging Face spaces.", fr: "Modules MLOps pratiques avec Vertex AI et Hugging Face." },
    for: { en: "Data-curious developers, analysts moving into modeling, and STEM graduates.", fr: "Développeurs curieux des données, analystes en transition et diplômés STEM." },
  },
  {
    id: "analytics",
    image: analyticsImg,
    delivery: "online",
    title: { en: "Data Analytics", fr: "Analyse de Données" },
    desc: { en: "SQL, dashboards and storytelling for business decisions.", fr: "SQL, tableaux de bord et storytelling pour les décisions métier." },
    what: { en: "Data Analytics is the practice of turning raw data into insights stakeholders can act on.", fr: "L'analyse de données transforme les données brutes en insights exploitables." },
    whatsnew: { en: "New modules on Power BI, Looker Studio and African market case studies.", fr: "Nouveaux modules sur Power BI, Looker Studio et études de cas africaines." },
    for: { en: "Business professionals, marketers and ops leads who want data fluency.", fr: "Professionnels métier, marketeurs et chefs ops voulant maîtriser la donnée." },
  },
  {
    id: "ds",
    image: dsImg,
    delivery: "physical",
    title: { en: "Data Science", fr: "Science des Données" },
    desc: { en: "Python, statistics and modelling to extract value from data.", fr: "Python, statistiques et modélisation pour valoriser la donnée." },
    what: { en: "Data Science blends statistics, programming and domain expertise to solve real-world problems with data.", fr: "La science des données mêle statistiques, programmation et expertise métier pour résoudre des problèmes réels." },
    whatsnew: { en: "Refreshed capstones on fintech fraud detection and agritech yield prediction.", fr: "Projets renouvelés en détection de fraude fintech et prédiction agritech." },
    for: { en: "Engineers, statisticians and researchers moving into data-driven roles.", fr: "Ingénieurs, statisticiens et chercheurs en transition vers la data." },
  },
  {
    id: "cyber",
    image: cyberImg,
    delivery: "online",
    title: { en: "Cybersecurity", fr: "Cybersécurité" },
    desc: { en: "Defend systems, run red-team exercises and earn industry certs.", fr: "Défendez les systèmes, menez des exercices red team et certifiez-vous." },
    what: { en: "Cybersecurity is the practice of protecting systems, networks and data from digital attacks.", fr: "La cybersécurité protège les systèmes, réseaux et données contre les attaques numériques." },
    whatsnew: { en: "New labs on cloud security, mobile-money fraud and SOC playbooks.", fr: "Nouveaux labs sur la sécurité cloud, fraude mobile money et playbooks SOC." },
    for: { en: "IT professionals, sysadmins and developers focused on secure software.", fr: "Professionnels IT, sysadmins et développeurs axés sur la sécurité." },
  },
];
