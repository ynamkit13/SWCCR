// Typed localStorage wrapper

export const storage = {
  get<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    const value = localStorage.getItem(key);
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  },

  remove(key: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },
};

// --- Types ---

export type UserProfile = {
  fitnessLevel: string;
  weeklyFrequency: number;
  goal: string;
  defaultSets: number;
  defaultReps: number;
  defaultRestDuration: number;
  onboardingComplete: boolean;
};

export type WorkoutSetLog = {
  setNumber: number;
  repsCompleted: number;
  formNotes: string;
};

export type WorkoutExerciseLog = {
  exerciseName: string;
  sets: WorkoutSetLog[];
};

export type WorkoutLog = {
  id: string;
  date: string;
  exercises: WorkoutExerciseLog[];
  aiSummary: string;
};

export type UserPreferences = {
  defaultMuted: boolean;
  audioDuckingEnabled: boolean;
};

// --- Keys ---

const KEYS = {
  PROFILE: "user_profile",
  WORKOUT_LOGS: "workout_logs",
  PREFERENCES: "user_preferences",
} as const;

// --- User Profile ---

export function getUserProfile(): UserProfile | null {
  return storage.get<UserProfile>(KEYS.PROFILE);
}

export function saveUserProfile(profile: UserProfile): void {
  storage.set(KEYS.PROFILE, profile);
}

// --- Workout Logs ---

export function getWorkoutLogs(): WorkoutLog[] {
  return storage.get<WorkoutLog[]>(KEYS.WORKOUT_LOGS) ?? [];
}

export function saveWorkoutLog(log: WorkoutLog): void {
  const logs = getWorkoutLogs();
  logs.push(log);
  storage.set(KEYS.WORKOUT_LOGS, logs);
}

// --- User Preferences ---

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultMuted: false,
  audioDuckingEnabled: true,
};

export function getUserPreferences(): UserPreferences {
  return storage.get<UserPreferences>(KEYS.PREFERENCES) ?? DEFAULT_PREFERENCES;
}

export function saveUserPreferences(prefs: Partial<UserPreferences>): void {
  const current = getUserPreferences();
  storage.set(KEYS.PREFERENCES, { ...current, ...prefs });
}
