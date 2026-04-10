import { UserProfile, WorkoutLog } from "./storage";

type Exercise = { name: string; sets: number; reps: number; rest: number };

const ALL_EXERCISES = ["Bicep Curls", "Lateral Raises", "Jumping Jacks"];

const EXERCISE_REST: Record<string, number> = {
  "Bicep Curls": 60,
  "Lateral Raises": 45,
  "Jumping Jacks": 30,
};

const MIN_REPS = 5;

/**
 * Generate today's workout based on user profile and workout history.
 * - Reorders exercises so the least recently done comes first.
 * - Applies progressive overload: bump reps if user completed all reps last time.
 * - Reduces reps if user struggled (< 70% completion).
 */
export function getSmartRecommendations(
  profile: UserProfile,
  logs: WorkoutLog[],
): Exercise[] {
  // Find when each exercise was last done
  const lastDone = new Map<string, number>();
  const lastPerformance = new Map<
    string,
    { targetReps: number; completedReps: number; sets: number }
  >();

  for (let i = 0; i < logs.length; i++) {
    for (const ex of logs[i].exercises) {
      if (ALL_EXERCISES.includes(ex.exerciseName)) {
        lastDone.set(ex.exerciseName, i);

        const totalCompleted = ex.sets.reduce((sum, s) => sum + s.repsCompleted, 0);
        lastPerformance.set(ex.exerciseName, {
          targetReps: profile.defaultReps,
          completedReps: totalCompleted,
          sets: ex.sets.length,
        });
      }
    }
  }

  // Sort exercises: least recently done first, never-done first
  const sorted = [...ALL_EXERCISES].sort((a, b) => {
    const aIdx = lastDone.get(a) ?? -1;
    const bIdx = lastDone.get(b) ?? -1;
    return aIdx - bIdx;
  });

  // Build exercise list with adjusted reps
  return sorted.map((name) => {
    let reps = profile.defaultReps;
    const sets = profile.defaultSets;
    const rest = EXERCISE_REST[name] ?? profile.defaultRestDuration;

    const perf = lastPerformance.get(name);
    if (perf) {
      const targetTotal = perf.targetReps * perf.sets;
      const completionRate = perf.completedReps / targetTotal;

      if (completionRate >= 1.0) {
        // Nailed it — bump up by 2
        reps = reps + 2;
      } else if (completionRate < 0.7) {
        // Struggled — reduce by 2, but not below minimum
        reps = Math.max(MIN_REPS, reps - 2);
      }
    }

    return { name, sets, reps, rest };
  });
}
