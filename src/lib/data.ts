export type Tier = "Beginner" | "Intermediate" | "Advanced" | "Expert" | "Master";
export type Difficulty = "Easy" | "Medium" | "Hard";
export type Language = "python" | "javascript" | "cpp" | "java";

export function getTier(rating: number): Tier {
  if (rating >= 2200) return "Master";
  if (rating >= 1800) return "Expert";
  if (rating >= 1400) return "Advanced";
  if (rating >= 1000) return "Intermediate";
  return "Beginner";
}

export const TIER_CLASS: Record<Tier, string> = {
  Beginner: "text-tier-beginner border-tier-beginner/40 bg-tier-beginner/10",
  Intermediate: "text-tier-intermediate border-tier-intermediate/40 bg-tier-intermediate/10",
  Advanced: "text-tier-advanced border-tier-advanced/40 bg-tier-advanced/10",
  Expert: "text-tier-expert border-tier-expert/40 bg-tier-expert/10",
  Master: "text-tier-master border-tier-master/40 bg-tier-master/10",
};

export const DIFF_CLASS: Record<Difficulty, string> = {
  Easy: "text-success bg-success/10 border-success/30",
  Medium: "text-warning bg-warning/10 border-warning/30",
  Hard: "text-destructive bg-destructive/10 border-destructive/30",
};

export interface Player {
  id: string;
  name: string;
  handle: string;
  rating: number;
  wins: number;
  losses: number;
  streak: number;
  country: string;
  hue: number;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  input: string;
  expected: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  statement: string[];
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  examples: Example[];
  tests: TestCase[];
  starter: Record<Language, string>;
}

export const LANGUAGES: { id: Language; label: string }[] = [
  { id: "python", label: "Python 3" },
  { id: "javascript", label: "JavaScript" },
  { id: "cpp", label: "C++ 17" },
  { id: "java", label: "Java 21" },
];

export function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
