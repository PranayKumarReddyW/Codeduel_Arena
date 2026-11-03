import { useEffect, useState, useCallback } from "react";
import type { Difficulty, Language } from "./data";
import {
  fetchUserProfile,
  updateUserProfile,
  loginUser,
  registerUser,
  logoutUser,
  getAuthToken,
  fetchCurrentUser,
  type UserProfileData,
  type MatchRecord,
} from "./api";

export type { MatchRecord };

export interface UserState extends UserProfileData {}

let globalUserState: UserState | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

let isInitialLoading = false;
let isAuthLoading = typeof window !== "undefined" ? Boolean(getAuthToken() && !globalUserState) : false;

async function syncFromBackend() {
  if (isInitialLoading) return;
  isInitialLoading = true;
  isAuthLoading = true;
  notify();
  try {
    const token = getAuthToken();
    if (!token) {
      globalUserState = null;
      isAuthLoading = false;
      notify();
      return;
    }
    const data = await fetchCurrentUser();
    globalUserState = {
      ...data,
      pending: globalUserState?.pending,
    };
  } catch (err) {
    console.warn("Could not sync user profile from backend API:", err);
    globalUserState = null;
  } finally {
    isInitialLoading = false;
    isAuthLoading = false;
    notify();
  }
}

export function setPendingMatch(
  pending:
    | {
        matchId: string;
        opponentId: string;
        problemId: string;
        isBot?: boolean;
        opponentName?: string;
        opponentHandle?: string;
      }
    | undefined,
) {
  if (globalUserState) {
    globalUserState = { ...globalUserState, pending };
    notify();
  }
}

export function writeUser(update: (u: UserState) => UserState) {
  if (!globalUserState) return;
  const next = update(globalUserState);
  const prev = globalUserState;
  globalUserState = next;
  notify();

  // If bio, languages, or name changed, sync to backend
  if (
    next.bio !== prev.bio ||
    next.name !== prev.name ||
    next.handle !== prev.handle ||
    JSON.stringify(next.languages) !== JSON.stringify(prev.languages)
  ) {
    updateUserProfile({
      name: next.name,
      handle: next.handle,
      bio: next.bio,
      languages: next.languages,
    }).catch((err) => console.error("Failed to update profile on backend:", err));
  }
}

export function useUser() {
  const [user, setUser] = useState<UserState | null>(globalUserState);
  const [isLoading, setIsLoading] = useState<boolean>(isAuthLoading);

  useEffect(() => {
    const sync = () => {
      setUser(globalUserState);
      setIsLoading(isAuthLoading);
    };
    listeners.add(sync);

    if (!globalUserState) {
      syncFromBackend();
    }

    return () => {
      listeners.delete(sync);
    };
  }, []);

  const update = useCallback((fn: (u: UserState) => UserState) => writeUser(fn), []);
  const refresh = useCallback(() => syncFromBackend(), []);

  const login = useCallback(async (usernameOrEmail: string, pass: string) => {
    const res = await loginUser(usernameOrEmail, pass);
    globalUserState = res.user;
    isAuthLoading = false;
    notify();
    return res.user;
  }, []);

  const register = useCallback(async (name: string, handle: string, email: string, pass: string) => {
    const res = await registerUser(name, handle, email, pass);
    globalUserState = res.user;
    isAuthLoading = false;
    notify();
    return res.user;
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    globalUserState = null;
    isAuthLoading = false;
    notify();
  }, []);

  const isAuthenticated = Boolean(getAuthToken());

  return { user, update, refresh, login, register, logout, isAuthenticated, isLoading };
}

export function statsOf(u: UserState) {
  if (u.stats) {
    return u.stats;
  }
  const wins = u.matches ? u.matches.filter((m) => m.result === "win").length : 0;
  const losses = u.matches ? u.matches.length - wins : 0;
  let streak = 0;
  if (u.matches) {
    for (const m of u.matches) {
      if (m.result === "win") streak++;
      else break;
    }
  }
  return {
    total: u.matches ? u.matches.length : 0,
    wins,
    losses,
    winRate: u.matches && u.matches.length ? Math.round((wins / u.matches.length) * 100) : 0,
    streak,
  };
}

export function newMatchId() {
  return `M-${Math.floor(100000 + Math.random() * 900000).toString(36).toUpperCase()}`;
}
