import { describe, it, expect, vi } from "vitest";
import { generateCoachingMessage, generateWorkoutSummary } from "../aiCoaching";

// Mock fetch for API route calls
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("AI Coaching", () => {
  it("returns coaching message for valid input", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: "Great set! Try slowing down the curl." }),
    });

    const result = await generateCoachingMessage({
      exercise: "Bicep Curls",
      setNumber: 1,
      repsCompleted: 10,
      formIssues: ["elbows drifting"],
    });

    expect(result).toBe("Great set! Try slowing down the curl.");
  });

  it("returns fallback message on error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await generateCoachingMessage({
      exercise: "Bicep Curls",
      setNumber: 1,
      repsCompleted: 10,
      formIssues: [],
    });

    expect(result).toContain("Good work");
  });
});

describe("AI Summary", () => {
  it("returns summary for valid workout data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ summary: "Excellent workout! Your form improved." }),
    });

    const result = await generateWorkoutSummary({
      exercises: [
        { name: "Bicep Curls", sets: 3, repsPerSet: [10, 10, 10], formIssues: [] },
      ],
    });

    expect(result).toBe("Excellent workout! Your form improved.");
  });

  it("returns fallback summary on error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await generateWorkoutSummary({
      exercises: [],
    });

    expect(result).toContain("Workout complete");
  });
});
