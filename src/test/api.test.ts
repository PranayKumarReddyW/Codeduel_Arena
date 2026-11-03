import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchProblems,
  fetchLeaderboard,
  fetchUserProfile,
  updateUserProfile,
  findMatch,
  executeRunCode,
  executeSubmitCode,
  fetchPlatformStats,
} from "../lib/api";

describe("Frontend API Client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetchProblems calls /problems endpoint", async () => {
    const mockProblems = [{ id: "two-sum", title: "Two Sum" }];
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockProblems,
    } as Response);

    const problems = await fetchProblems();
    expect(problems).toEqual(mockProblems);
  });

  it("fetchLeaderboard appends query params", async () => {
    const mockPlayers = [{ id: "p1", name: "Aiko Tanaka", rating: 2487 }];
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlayers,
    } as Response);

    const players = await fetchLeaderboard("Weekly", "aiko");
    expect(players).toEqual(mockPlayers);
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/players/leaderboard?period=Weekly&q=aiko"),
      expect.any(Object),
    );
  });

  it("executeRunCode sends code to backend", async () => {
    const mockResponse = {
      success: true,
      logs: ["> Compiling..."],
      results: [],
      mock: true,
    };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const res = await executeRunCode({
      problemId: "two-sum",
      language: "python",
      code: "print('hello')",
    });
    expect(res.success).toBe(true);
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/code/run"),
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("fetchPlatformStats fetches live platform overview", async () => {
    const mockStats = { activeBattlers: 2847, queueCount: 42, totalMatchesPlayed: 14820 };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    } as Response);

    const stats = await fetchPlatformStats();
    expect(stats.activeBattlers).toBe(2847);
  });
});

