import { describe, it, expect, beforeEach } from "vitest";
import {
  storage,
  getUserProfile,
  saveUserProfile,
  getWorkoutLogs,
  saveWorkoutLog,
  getUserPreferences,
  saveUserPreferences,
  UserProfile,
  WorkoutLog,
} from "../storage";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

describe("Storage utility", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("reads and writes correctly", () => {
    storage.set("test-key", { foo: "bar" });
    expect(storage.get("test-key")).toEqual({ foo: "bar" });
  });

  it("returns null for missing key", () => {
    expect(storage.get("nonexistent")).toBeNull();
  });

  it("removes a key", () => {
    storage.set("key", "value");
    storage.remove("key");
    expect(storage.get("key")).toBeNull();
  });
});

describe("UserProfile", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("saves and reads user profile", () => {
    const profile: UserProfile = {
      fitnessLevel: "beginner",
      weeklyFrequency: 3,
      goal: "strength",
      defaultSets: 3,
      defaultReps: 10,
      defaultRestDuration: 60,
      onboardingComplete: true,
    };
    saveUserProfile(profile);
    expect(getUserProfile()).toEqual(profile);
  });

  it("returns null when no profile exists", () => {
    expect(getUserProfile()).toBeNull();
  });
});

describe("WorkoutLogs", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("saves a workout log", () => {
    const log: WorkoutLog = {
      id: "test-1",
      date: "2026-04-10",
      exercises: [
        {
          exerciseName: "Bicep Curls",
          sets: [{ setNumber: 1, repsCompleted: 10, formNotes: "Good form" }],
        },
      ],
      aiSummary: "Great workout!",
    };
    saveWorkoutLog(log);
    const logs = getWorkoutLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].id).toBe("test-1");
  });

  it("appends to existing logs", () => {
    saveWorkoutLog({
      id: "1",
      date: "2026-04-09",
      exercises: [],
      aiSummary: "",
    });
    saveWorkoutLog({
      id: "2",
      date: "2026-04-10",
      exercises: [],
      aiSummary: "",
    });
    expect(getWorkoutLogs()).toHaveLength(2);
  });

  it("returns empty array when no logs exist", () => {
    expect(getWorkoutLogs()).toEqual([]);
  });
});

describe("UserPreferences", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("saves and reads preferences", () => {
    saveUserPreferences({ defaultMuted: true, audioDuckingEnabled: false });
    const prefs = getUserPreferences();
    expect(prefs.defaultMuted).toBe(true);
    expect(prefs.audioDuckingEnabled).toBe(false);
  });

  it("returns defaults when no preferences exist", () => {
    const prefs = getUserPreferences();
    expect(prefs.defaultMuted).toBe(false);
    expect(prefs.audioDuckingEnabled).toBe(true);
  });
});
