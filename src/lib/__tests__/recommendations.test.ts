import { describe, it, expect, beforeEach, vi } from "vitest";
import { getSmartRecommendations } from "../recommendations";
import { WorkoutLog, UserProfile } from "../storage";

describe("getSmartRecommendations", () => {
  const baseProfile: UserProfile = {
    fitnessLevel: "beginner",
    weeklyFrequency: 3,
    goal: "active",
    defaultSets: 3,
    defaultReps: 10,
    defaultRestDuration: 60,
    onboardingComplete: true,
  };

  it("returns all 3 exercises with default values when no history", () => {
    const result = getSmartRecommendations(baseProfile, []);
    expect(result).toHaveLength(3);
    expect(result.map((e) => e.name)).toEqual([
      "Bicep Curls",
      "Lateral Raises",
      "Jumping Jacks",
    ]);
    expect(result[0].sets).toBe(3);
    expect(result[0].reps).toBe(10);
  });

  it("puts least recently done exercise first", () => {
    const logs: WorkoutLog[] = [
      {
        id: "1",
        date: "2026-04-08",
        exercises: [
          {
            exerciseName: "Bicep Curls",
            sets: [{ setNumber: 1, repsCompleted: 10, formNotes: "" }],
          },
          {
            exerciseName: "Lateral Raises",
            sets: [{ setNumber: 1, repsCompleted: 12, formNotes: "" }],
          },
          {
            exerciseName: "Jumping Jacks",
            sets: [{ setNumber: 1, repsCompleted: 20, formNotes: "" }],
          },
        ],
        aiSummary: "",
      },
      {
        id: "2",
        date: "2026-04-09",
        exercises: [
          {
            exerciseName: "Bicep Curls",
            sets: [{ setNumber: 1, repsCompleted: 10, formNotes: "" }],
          },
          {
            exerciseName: "Jumping Jacks",
            sets: [{ setNumber: 1, repsCompleted: 20, formNotes: "" }],
          },
        ],
        aiSummary: "",
      },
    ];

    const result = getSmartRecommendations(baseProfile, logs);
    // Lateral Raises was last done on 04-08, others on 04-09
    expect(result[0].name).toBe("Lateral Raises");
  });

  it("bumps reps when user completed all reps in last session", () => {
    const logs: WorkoutLog[] = [
      {
        id: "1",
        date: "2026-04-09",
        exercises: [
          {
            exerciseName: "Bicep Curls",
            sets: [
              { setNumber: 1, repsCompleted: 10, formNotes: "Good form" },
              { setNumber: 2, repsCompleted: 10, formNotes: "Good form" },
              { setNumber: 3, repsCompleted: 10, formNotes: "Good form" },
            ],
          },
        ],
        aiSummary: "",
      },
    ];

    const result = getSmartRecommendations(baseProfile, logs);
    const curls = result.find((e) => e.name === "Bicep Curls")!;
    // Completed all 10 reps across all 3 sets → bump reps
    expect(curls.reps).toBeGreaterThan(10);
  });

  it("does not bump reps when user fell short", () => {
    const logs: WorkoutLog[] = [
      {
        id: "1",
        date: "2026-04-09",
        exercises: [
          {
            exerciseName: "Bicep Curls",
            sets: [
              { setNumber: 1, repsCompleted: 10, formNotes: "" },
              { setNumber: 2, repsCompleted: 8, formNotes: "" },
              { setNumber: 3, repsCompleted: 6, formNotes: "" },
            ],
          },
        ],
        aiSummary: "",
      },
    ];

    const result = getSmartRecommendations(baseProfile, logs);
    const curls = result.find((e) => e.name === "Bicep Curls")!;
    expect(curls.reps).toBe(10);
  });

  it("reduces reps when user struggled (completed less than 70%)", () => {
    const logs: WorkoutLog[] = [
      {
        id: "1",
        date: "2026-04-09",
        exercises: [
          {
            exerciseName: "Bicep Curls",
            sets: [
              { setNumber: 1, repsCompleted: 6, formNotes: "" },
              { setNumber: 2, repsCompleted: 5, formNotes: "" },
              { setNumber: 3, repsCompleted: 4, formNotes: "" },
            ],
          },
        ],
        aiSummary: "",
      },
    ];

    const result = getSmartRecommendations(baseProfile, logs);
    const curls = result.find((e) => e.name === "Bicep Curls")!;
    // 15/30 = 50% completion → reduce reps
    expect(curls.reps).toBeLessThan(10);
  });

  it("uses profile defaults for exercises with no history", () => {
    const logs: WorkoutLog[] = [
      {
        id: "1",
        date: "2026-04-09",
        exercises: [
          {
            exerciseName: "Bicep Curls",
            sets: [{ setNumber: 1, repsCompleted: 10, formNotes: "" }],
          },
        ],
        aiSummary: "",
      },
    ];

    const result = getSmartRecommendations(baseProfile, logs);
    const raises = result.find((e) => e.name === "Lateral Raises")!;
    expect(raises.sets).toBe(baseProfile.defaultSets);
  });

  it("never drops reps below a minimum of 5", () => {
    const profile = { ...baseProfile, defaultReps: 6 };
    const logs: WorkoutLog[] = [
      {
        id: "1",
        date: "2026-04-09",
        exercises: [
          {
            exerciseName: "Bicep Curls",
            sets: [
              { setNumber: 1, repsCompleted: 2, formNotes: "" },
              { setNumber: 2, repsCompleted: 1, formNotes: "" },
            ],
          },
        ],
        aiSummary: "",
      },
    ];

    const result = getSmartRecommendations(profile, logs);
    const curls = result.find((e) => e.name === "Bicep Curls")!;
    expect(curls.reps).toBeGreaterThanOrEqual(5);
  });
});
