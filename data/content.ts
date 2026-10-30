/* ============================================================
   SITE CONTENT — single typed source of truth.
   Edit text here, never inside components.
   Every missing fact is marked with TODO — fill it in and it
   appears on the site automatically.
   ============================================================ */

export type ProjectStatus = "live" | "beta" | "wip";

/** Grouped tech stack shown inside a case study */
export interface ProjectStack {
  frontend: string[];
  backend: string[];
  ml: string[];
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  status: ProjectStatus;
  image: { src: string; width: number; height: number; alt: string };
  problem: string;
  built: string;
  /** Flat list for a simple stack — use `stack` instead when it needs grouping */
  tech?: string[];
  stack?: ProjectStack;
  result: string;
  repo?: string;
}

export interface Social {
  label: string;
  href: string;
}

export const site = {
  name: "Suvendu Kumar",
  short: "Shuv",
  role: "AI/ML builder who ships real systems",
  oneLiner:
    "I'm Shuv — an AI/ML builder who ships real systems: fraud analytics tested on 53,197 public works, document AI with receipts, and a multi-agent research platform.",
  location: "Odisha, India",
  college: "Trident Academy of Technology",
  branch: "B.Tech CSE (AI/ML)",
  /** TODO: add your production domain after the first Vercel deploy (used for sitemap/OG) */
  url: "https://your-portfolio.vercel.app",
} as const;

export const socials: Social[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/suvendu-kumar" },
  { label: "X", href: "https://x.com/subh792465" },
  { label: "GitHub", href: "https://github.com/suvendu-2006" },
];

/**
 * TODO: set your public email (or wire the contact form via /api/contact —
 * see that file). While null, the email button stays hidden.
 */
export const email: string | null = null;

export const proofStrip = [
  { value: "53,197", label: "public works analyzed" },
  { value: "15", label: "automated forensic checks" },
  { value: "788", label: "MPs covered" },
] as const;

export const projects: Project[] = [
  {
    id: "satark-mplads",
    name: "SATARK-MPLADS",
    tagline:
      "Cross-checks e-SAKSHI and PFMS records to detect fraud in India's MPLADS scheme.",
    status: "live",
    image: {
      src: "/images/satark.jpg",
      width: 1440,
      height: 1080,
      alt: "SATARK-MPLADS dashboard — 788 MPs tracked, ₹11,777 Cr allocated, state-wise outlay chart",
    },
    problem:
      "MPLADS is a multi-crore public works fund, and the official e-SAKSHI and PFMS records don't cross-check themselves. Discrepancies between allocation and expenditure are easy to miss at national scale.",
    built:
      "A public intelligence portal that ingests both record systems, runs 15 automated forensic checks (duplicate works, payment gaps, out-of-pattern expenditure), and presents the findings as a filterable national dashboard.",
    stack: {
      frontend: [
        "React 19",
        "TypeScript",
        "Vite",
        "Tailwind CSS v4",
        "Leaflet — interactive GIS constituency mapping",
        "Streamlit forensic workbench",
      ],
      backend: ["FastAPI", "SQLAlchemy (SQLite WAL / PostgreSQL)"],
      ml: [
        "HistGradientBoosting",
        "Isolation Forest",
        "Sentence-Transformers NLP",
        "Benford's Law statistical analysis",
      ],
    },
    result:
      "Tested on 53,197 real public works covering 788 MPs, with live MoSPL/e-SAKSHI-verified data displayed state by state.",
    repo: "https://github.com/suvendu-2006/mplads-intelligence-portal",
  },
  {
    id: "orbit-ai",
    name: "ORBIT AI",
    tagline: "Multi-agent research and productivity platform.",
    status: "beta",
    image: {
      src: "/images/orbit.svg",
      width: 1200,
      height: 900,
      alt: "ORBIT AI — network of agent nodes orbiting a core model",
    },
    problem:
      "Deep research means juggling search, synthesis, and writing across a dozen tabs — context gets lost between steps.",
    built:
      "A platform where specialized agents collaborate on research and productivity workflows, coordinated around a shared context core.",
    tech: ["Python", "LLM agents"],
    // TODO: fill in the one-line status and links when ORBIT AI ships
    result: "TODO: one-line status — currently in beta.",
    // TODO: add live link when available
    repo: "https://github.com/suvendu-2006",
  },
  {
    id: "allcited",
    name: "Allcited",
    tagline:
      "Answers questions from uploaded documents with clickable source proof.",
    status: "live",
    image: {
      src: "/images/allcited.jpg",
      width: 1440,
      height: 1080,
      alt: "Allcited landing page — “Answers, with receipts.”",
    },
    problem:
      "AI answers to document questions are only as good as their sources — without citations you can't tell grounded answers from guesses.",
    built:
      "Upload a document, ask anything, and every sentence of the answer carries a clickable citation that jumps to the exact passage it came from.",
    tech: ["Python", "LLMs", "Citations"],
    result:
      "Live and open for testing — guest mode, nothing saved unless you keep it, published test scores.",
    // TODO: add the GitHub repo link for Allcited
    repo: "https://github.com/suvendu-2006",
  },
];

/**
 * "What I actually use" — kept deliberately short and honest.
 */
export const skills = [
  { name: "Python", level: null },
  { name: "Vercel", level: null },
  { name: "Git & GitHub", level: null },
  { name: "Machine Learning", level: "Intermediate" },
  { name: "RAG", level: "Intermediate" },
] as const;

export const about = {
  /** First person, under 120 words */
  body: [
    "I'm Suvendu — a B.Tech CSE (AI/ML) student at Trident Academy of Technology in Odisha, India.",
    "I started in first year with C, and somewhere between printf and Python I got hooked on building systems that reason over real data. Since then I've shipped SATARK-MPLADS, a fraud-analytics portal tested on 53,197 real public works; Allcited, document Q&A with receipts; and ORBIT AI, a multi-agent research platform.",
  ],
} as const;
