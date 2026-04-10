import { describe, it, expect } from "vitest";
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

  it("returns all 3 exercises with profile defaults when no history", () => {
    const result = getSmartRecommendations(baseProfile, []);
    expect(result).toHaveLength(3);
    expect(result.map((e) => e.name)).toEqual([
      "Bicep Curls",
      "Lateral Raises",
      "Jumping Jacks",
    ]);
    expect(result[0]).toEqual({ name: "Bicep Curls", sets: 3, reps: 10, rest: 60 });
    expect(result[1]).toEqual({ name: "Lateral Raises", sets: 3, reps: 10, rest: 45 });
    expect(result[2]).toEqual({ name: "Jumping Jacks", sets: 3, reps: 10, rest: 30 });
  });

  it("reorders all exercises by recency — least recent first", () => {
    const logs: WorkoutLog[] = [
      {
        id: "1",
        date: "2026-04-08",
        exercises: [
          { exerciseName: "Bicep Curls", sets: [{ setNumber: 1, repsCompleted: 10, formNotes: "" }] },
          { exerciseName: "Lateral Raises", sets: [{ setNumber: 1, repsCompleted: 10, formNotes: "" }] },
          { exerciseName: "Jumping Jacks", sets: [{ setNumber: 1, repsCompleted: 10, formNotes: "" }] },
        ],
        aiSummary: "",
      },
      {
        id: "2",
        date: "2026-04-09",
        exercises: [
          { exerciseName: "Bicep Curls", sets: [{ setNumber: 1, repsCompleted: 10, formNotes: "" }] },
          { exerciseName: "Jumping Jacks", sets: [{ setNumber: 1, repsCompleted: 10, formNotes: "" }] },
        ],
        aiSummary: "",
      },
    ];

    const result = getSmartRecommendations(baseProfile, logs);
    // Lateral Raises last at index 0, Bicep Curls & Jumping Jacks at index 1
    expect(result.map((e) => e.name)).toEqual([
      "Lateral Raises",
      "Bicep Curls",
      "Jumping Jacks",
    ]);
  });

  it("bumps reps by 2 when user completed all reps in every set", () => {
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
    expect(curls.reps).toBe(12);
  });

  it("compounds progressive overload across sessions", () => {
    const logs: WorkoutLog[] = [
      {
        id: "1",
        date: "2026-04-08",
        exercises: [
          {
            exerciseName: "Bicep Curls",
            sets: [
              { setNumber: 1, repsCompleted: 10, formNotes: "" },
              { setNumber: 2, repsCompleted: 10, formNotes: "" },
              { setNumber: 3, repsCompleted: 10, formNotes: "" },
            ],
          },
        ],
        aiSummary: "",
      },
      {
        id: "2",
        date: "2026-04-09",
        exercises: [
          {
            // User was given 12 reps (bumped from 10) and completed all
            exerciseName: "Bicep Curls",
            sets: [
              { setNumber: 1, repsCompleted: 12, formNotes: "" },
              { setNumber: 2, repsCompleted: 12, formNotes: "" },
              { setNumber: 3, repsCompleted: 12, formNotes: "" },
            ],
          },
        ],
        aiSummary: "",
      },
    ];

    const result = getSmartRecommendations(baseProfile, logs);
    const curls = result.find((e) => e.name === "Bicep Curls")!;
    // Should be 14 (12 + 2), not 12 (10 + 2)
    expect(curls.reps).toBe(14);
  });

  it("keeps reps the same when user fell short but above 70%", () => {
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
    // 24/30 = 80% — above 70%, so no change
    expect(curls.reps).toBe(10);
  });

  it("reduces reps by 2 when user struggled (below 70% completion)", () => {
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
    // 15/30 = 50% → reduce from 10 to 8
    expect(curls.reps).toBe(8);
  });

  it("uses profile defaults for exercises with no history", () => {
    const logs: WorkoutLog[] = [
      {
        id: "1",
        date: "2026-04-09",
        exercises: [
          { exerciseName: "Bicep Curls", sets: [{ setNumber: 1, repsCompleted: 10, formNotes: "" }] },
        ],
        aiSummary: "",
      },
    ];

    const result = getSmartRecommendations(baseProfile, logs);
    const raises = result.find((e) => e.name === "Lateral Raises")!;
    expect(raises.sets).toBe(3);
    expect(raises.reps).toBe(10);
    expect(raises.rest).toBe(45);
  });

  it("never drops reps below 5", () => {
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
    // 3/12 = 25% → would reduce to 4, but min is 5
    expect(curls.reps).toBe(5);
  });

  it("assigns correct rest durations per exercise", () => {
    const result = getSmartRecommendations(baseProfile, []);
    expect(result.find((e) => e.name === "Bicep Curls")!.rest).toBe(60);
    expect(result.find((e) => e.name === "Lateral Raises")!.rest).toBe(45);
    expect(result.find((e) => e.name === "Jumping Jacks")!.rest).toBe(30);
  });
});
