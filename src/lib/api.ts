import type { Difficulty, Language, Player, Problem, Tier } from "./data";

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

export interface UserStats {
  total: number;
  wins: number;
  losses: number;
  winRate: number;
  streak: number;
}

export interface DayActivity {
  day: string;
  wins: number;
  losses: number;
}

export interface UserProfileData {
  name: string;
  handle: string;
  bio: string;
  rating: number;
  languages: Language[];
  matches: MatchRecord[];
  stats: UserStats;
  weeklyActivity: DayActivity[];
  pending?: {
    matchId: string;
    opponentId: string;
    problemId: string;
    isBot?: boolean;
    opponentName?: string;
    opponentHandle?: string;
  } | undefined;
}

export interface RatingProgressionPoint {
  n: number;
  rating: number;
  date: string;
}

export interface TestCaseResult {
  status: "pass" | "fail";
  output: string;
  expected: string;
  time: number;
  memory: number;
}

export interface ExecuteCodeResponse {
  success: boolean;
  logs: string[];
  results: TestCaseResult[];
  mock: boolean;
}

export interface SubmitCodeResponse {
  accepted: boolean;
  passedTests: number;
  totalTests: number;
  runtimeMs: number;
  memoryMb: number;
  logs: string[];
  results: TestCaseResult[];
  mock: boolean;
}

export interface PlatformStats {
  activeBattlers: number;
  queueCount: number;
  totalMatchesPlayed: number;
}

export interface MatchmakingResult {
  matchId: string | null;
  opponent: Player | null;
  problem: Problem | null;
  isBot?: boolean;
  statusMessage?: string;
  isWaiting?: boolean;
  queueCount?: number;
}

export interface AuthResponse {
  token: string;
  user: UserProfileData;
}

const TOKEN_KEY = "codeduel_auth_token";

export function getClientSessionId(): string {
  if (typeof window === "undefined") return "server";
  let sid = sessionStorage.getItem("codeduel_session_id");
  if (!sid) {
    sid = Math.random().toString(36).substring(2, 10);
    sessionStorage.setItem("codeduel_session_id", sid);
  }
  return sid;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" && window.location.port === "8080"
    ? "http://localhost:8088/api"
    : "/api");

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const errorJson = await response.json();
      errorMsg = errorJson.message || errorJson.error || JSON.stringify(errorJson);
    } catch {
      const errorText = await response.text();
      if (errorText) errorMsg = errorText;
    }
    throw new Error(errorMsg || `API error ${response.status}`);
  }

  return response.json();
}

// Authentication API
export async function loginUser(usernameOrEmail: string, password: string): Promise<AuthResponse> {
  const res = await request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ usernameOrEmail, password }),
  });
  if (res.token) {
    setAuthToken(res.token);
  }
  return res;
}

export async function registerUser(name: string, handle: string, email: string, password: string): Promise<AuthResponse> {
  const res = await request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, handle, email, password }),
  });
  if (res.token) {
    setAuthToken(res.token);
  }
  return res;
}

export async function fetchCurrentUser(): Promise<UserProfileData> {
  return request<UserProfileData>("/auth/me");
}

export function logoutUser() {
  setAuthToken(null);
}

// Problems API
export async function fetchProblems(): Promise<Problem[]> {
  return request<Problem[]>("/problems");
}

export async function fetchProblem(id: string): Promise<Problem> {
  return request<Problem>(`/problems/${id}`);
}

// Players & Leaderboard API
export async function fetchPlayers(): Promise<Player[]> {
  return request<Player[]>("/players");
}

export async function fetchPlayer(id: string): Promise<Player> {
  return request<Player>(`/players/${id}`);
}

export async function fetchLeaderboard(period: string = "All-Time", q: string = ""): Promise<Player[]> {
  const params = new URLSearchParams();
  if (period) params.append("period", period);
  if (q) params.append("q", q);
  return request<Player[]>(`/players/leaderboard?${params.toString()}`);
}

// User Profile & Stats API
export async function fetchUserProfile(): Promise<UserProfileData> {
  return request<UserProfileData>("/user/profile");
}

export async function updateUserProfile(data: {
  name?: string;
  handle?: string;
  bio?: string;
  languages?: Language[];
}): Promise<UserProfileData> {
  return request<UserProfileData>("/user/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function fetchRatingProgression(): Promise<RatingProgressionPoint[]> {
  return request<RatingProgressionPoint[]>("/user/progression");
}

// Matches API
export async function fetchMatches(outcome: string = "All", difficulty: string = "All"): Promise<MatchRecord[]> {
  const params = new URLSearchParams();
  if (outcome) params.append("outcome", outcome);
  if (difficulty) params.append("difficulty", difficulty);
  return request<MatchRecord[]>(`/matches?${params.toString()}`);
}

export async function fetchMatch(id: string): Promise<MatchRecord> {
  return request<MatchRecord>(`/matches/${id}`);
}

export async function recordMatch(record: {
  id: string;
  opponentId: string;
  problemId: string;
  difficulty: Difficulty;
  result: "win" | "loss";
  delta: number;
  duration: number;
  date?: string;
  language: Language;
  ratingAfter?: number;
}): Promise<MatchRecord> {
  return request<MatchRecord>("/matches", {
    method: "POST",
    body: JSON.stringify(record),
  });
}

// Matchmaking API
export async function findMatch(userRating?: number, allowBotFallback: boolean = false): Promise<MatchmakingResult> {
  return request<MatchmakingResult>("/matchmaking/find", {
    method: "POST",
    body: JSON.stringify({ userRating, allowBotFallback, clientSessionId: getClientSessionId() }),
  });
}

export async function cancelMatchmakingQueue(): Promise<void> {
  await request<void>("/matchmaking/cancel", {
    method: "POST",
  });
}

export interface MatchRoomData {
  matchId: string;
  problem: Problem;
  opponent: Player;
  isBot: boolean;
  startedAt: number;
}

export async function fetchMatchRoom(matchId: string): Promise<MatchRoomData> {
  return request<MatchRoomData>(`/matchmaking/room/${matchId}`);
}

// Code Execution & Judge0 API
export async function executeRunCode(req: {
  problemId: string;
  language: Language;
  code: string;
}): Promise<ExecuteCodeResponse> {
  return request<ExecuteCodeResponse>("/code/run", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function executeSubmitCode(req: {
  matchId: string;
  problemId: string;
  language: Language;
  code: string;
}): Promise<SubmitCodeResponse> {
  return request<SubmitCodeResponse>("/code/submit", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

// Platform API
export async function fetchPlatformStats(): Promise<PlatformStats> {
  return request<PlatformStats>("/platform/stats");
}

export async function fetchPlatformLanguages(): Promise<{ id: Language; label: string; judge0Id: number }[]> {
  return request<{ id: Language; label: string; judge0Id: number }[]>("/platform/languages");
}
