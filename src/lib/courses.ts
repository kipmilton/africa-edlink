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
  {
    id: "ethical-hacking",
    image: cyberImg,
    delivery: "online",
    title: { en: "Ethical Hacking", fr: "Piratage Éthique" },
    desc: { en: "Offensive security: recon, exploitation and reporting like a pro red-teamer.", fr: "Sécurité offensive : reconnaissance, exploitation et rapports comme un red-teamer." },
    what: { en: "Ethical hacking is authorised offensive testing that finds weaknesses before criminals do.", fr: "Le piratage éthique est un test offensif autorisé qui détecte les failles avant les criminels." },
    whatsnew: { en: "New labs on API abuse, mobile-money attack paths and cloud privilege escalation.", fr: "Nouveaux labs sur l'abus d'API, les attaques mobile money et l'escalade de privilèges cloud." },
    for: { en: "Security analysts and sysadmins moving into penetration testing.", fr: "Analystes sécurité et sysadmins en transition vers les tests d'intrusion." },
  },
  {
    id: "soc-analysis",
    image: cyberImg,
    delivery: "online",
    title: { en: "SOC Analysis", fr: "Analyse SOC" },
    desc: { en: "Monitor, triage and escalate real threats inside a Security Operations Centre.", fr: "Surveillez, triez et escaladez les menaces réelles dans un centre d'opérations de sécurité." },
    what: { en: "SOC analysis is the day-to-day discipline of detecting and responding to security alerts at scale.", fr: "L'analyse SOC est la discipline quotidienne de détection et réponse aux alertes de sécurité." },
    whatsnew: { en: "Hands-on SIEM playbooks with Wazuh, Splunk queries and MITRE ATT&CK mapping.", fr: "Playbooks SIEM pratiques avec Wazuh, requêtes Splunk et cartographie MITRE ATT&CK." },
    for: { en: "Aspiring blue-team analysts and IT support staff moving into security.", fr: "Futurs analystes blue team et personnel IT en transition vers la sécurité." },
  },
  {
    id: "digital-forensics",
    image: cyberImg,
    delivery: "hybrid",
    title: { en: "Digital Forensics & Incident Response", fr: "Investigation Numérique & Réponse aux Incidents" },
    desc: { en: "Acquire evidence, trace attackers and produce court-ready forensic reports.", fr: "Collectez des preuves, tracez les attaquants et produisez des rapports recevables." },
    what: { en: "DFIR combines forensic evidence handling with structured incident response to contain and explain breaches.", fr: "Le DFIR combine la gestion de preuves et une réponse structurée pour contenir et expliquer les incidents." },
    whatsnew: { en: "New modules on disk and memory imaging, mobile forensics and chain-of-custody workflows.", fr: "Nouveaux modules sur l'imagerie disque/mémoire, la forensique mobile et la chaîne de possession." },
    for: { en: "Security professionals, auditors and law-enforcement technologists.", fr: "Professionnels de la sécurité, auditeurs et technologues des forces de l'ordre." },
  },
  {
    id: "kids-coding-game-dev",
    image: fullstackImg,
    delivery: "online",
    title: { en: "Kids Coding & Game Dev (7–17)", fr: "Code & Jeux pour Enfants (7–17)" },
    desc: { en: "Young builders create their first games and websites, step by step.", fr: "Les jeunes créent leurs premiers jeux et sites web, étape par étape." },
    what: { en: "A playful introduction to logic, Scratch, Python and simple web pages for ages 7–17.", fr: "Une introduction ludique à la logique, Scratch, Python et pages web simples pour 7–17 ans." },
    whatsnew: { en: "New project pack: build and publish your own arcade game.", fr: "Nouveau pack projet : créez et publiez votre propre jeu d'arcade." },
    for: { en: "Learners aged 7–17 with no prior coding experience.", fr: "Apprenants de 7 à 17 ans sans expérience préalable." },
  },
  {
    id: "kids-ai-robotics",
    image: aiImg,
    delivery: "hybrid",
    title: { en: "Kids AI & Robotics (7–17)", fr: "IA & Robotique pour Enfants (7–17)" },
    desc: { en: "Hands-on AI experiments and beginner robotics kits for curious minds.", fr: "Expériences IA pratiques et kits de robotique pour esprits curieux." },
    what: { en: "Kids train simple AI models, build sensors and program robots to solve fun challenges.", fr: "Les enfants entraînent des modèles simples, assemblent des capteurs et programment des robots." },
    whatsnew: { en: "Added micro:bit and Arduino starter missions.", fr: "Nouvelles missions micro:bit et Arduino." },
    for: { en: "Curious learners aged 7–17 who love building things.", fr: "Apprenants de 7 à 17 ans qui aiment construire." },
  },
  {
    id: "kids-cyber-safety",
    image: cyberImg,
    delivery: "online",
    title: { en: "Kids Cybersecurity & Internet Safety (7–17)", fr: "Cybersécurité & Sécurité en Ligne (7–17)" },
    desc: { en: "Stay safe online: passwords, scams, privacy and digital citizenship.", fr: "Restez en sécurité en ligne : mots de passe, arnaques, confidentialité et citoyenneté numérique." },
    what: { en: "A practical safety course teaching young people how to spot scams and protect their accounts.", fr: "Un cours pratique qui apprend aux jeunes à repérer les arnaques et protéger leurs comptes." },
    whatsnew: { en: "New lessons on social media privacy and mobile-money scam awareness.", fr: "Nouvelles leçons sur la confidentialité des réseaux sociaux et les arnaques mobile money." },
    for: { en: "Learners aged 7–17 and parents who want safer screen time.", fr: "Apprenants de 7 à 17 ans et parents souhaitant un temps d'écran plus sûr." },
  },
];
