import { useEffect, useState, useCallback } from "react";
import { PLAYERS, PROBLEMS, type Difficulty, type Language } from "./data";

export interface MatchRecord {
  id: string;
  opponentId: string;
  problemId: string;
  difficulty: Difficulty;
  result: "win" | "loss";
  delta: number;
  duration: number; // seconds
  date: string; // ISO
  language: Language;
  ratingAfter: number;
}

export interface UserState {
  name: string;
  handle: string;
  bio: string;
  rating: number;
  languages: Language[];
  matches: MatchRecord[];
  pending?: { matchId: string; opponentId: string; problemId: string } | undefined;
}

const KEY = "codeduel:user:v1";

function seed(): UserState {
  // Deterministic seed history (no randomness at module scope).
  const matches: MatchRecord[] = [];
  let rating = 1180;
  const now = Date.UTC(2026, 10, 1, 18, 0, 0);
  for (let i = 0; i < 24; i++) {
    const win = (i * 7) % 5 !== 0 && i % 4 !== 3;
    const delta = win ? 18 + ((i * 3) % 12) : -(12 + ((i * 5) % 10));
    rating += delta;
    const prob = PROBLEMS[i % PROBLEMS.length]!;
    const opp = PLAYERS[6 + (i % 9)]!;
    matches.push({
      id: `M-${(48210 + i).toString(36).toUpperCase()}`,
      opponentId: opp.id,
      problemId: prob.id,
      difficulty: prob.difficulty,
      result: win ? "win" : "loss",
      delta,
      duration: 240 + ((i * 97) % 900),
      date: new Date(now - (23 - i) * 36 * 3600 * 1000).toISOString(),
      language: (["python", "javascript", "cpp", "python"] as Language[])[i % 4]!,
      ratingAfter: rating,
    });
  }
  return {
    name: "Alex Rivera",
    handle: "alexr",
    bio: "Full-stack dev by day, competitive programmer by night. Graphs & DP enjoyer.",
    rating,
    languages: ["python", "javascript", "cpp"],
    matches: matches.reverse(),
  };
}

function read(): UserState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const s = seed();
  localStorage.setItem(KEY, JSON.stringify(s));
  return s;
}

const listeners = new Set<() => void>();

export function writeUser(update: (u: UserState) => UserState) {
  const next = update(read());
  localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

export function useUser() {
  const [user, setUser] = useState<UserState | null>(null);
  useEffect(() => {
    const sync = () => setUser(read());
    sync();
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, []);
  const update = useCallback((fn: (u: UserState) => UserState) => writeUser(fn), []);
  return { user, update };
}

export function statsOf(u: UserState) {
  const wins = u.matches.filter((m) => m.result === "win").length;
  const losses = u.matches.length - wins;
  let streak = 0;
  for (const m of u.matches) {
    if (m.result === "win") streak++;
    else break;
  }
  return {
    total: u.matches.length,
    wins,
    losses,
    winRate: u.matches.length ? Math.round((wins / u.matches.length) * 100) : 0,
    streak,
  };
}

export function newMatchId() {
  return `M-${Math.floor(100000 + Math.random() * 900000).toString(36).toUpperCase()}`;
}
