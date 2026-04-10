"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { getWorkoutLogs, WorkoutLog } from "@/lib/storage";

const defaultWorkout = [
  { name: "Bicep Curls", sets: 3, reps: 10 },
  { name: "Lateral Raises", sets: 3, reps: 12 },
  { name: "Jumping Jacks", sets: 3, reps: 20 },
];

export default function HomePage({
  showEmptyHistory = false,
}: {
  showEmptyHistory?: boolean;
}) {
  const router = useRouter();
  const [history, setHistory] = useState<WorkoutLog[]>([]);
  const [todaysWorkout, setTodaysWorkout] = useState(defaultWorkout);

  useEffect(() => {
    if (!showEmptyHistory) {
      const logs = getWorkoutLogs();
      setHistory(logs);
    }

    // Load recommended exercises if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("recommended_exercises");
      if (saved) {
        const exercises = JSON.parse(saved);
        setTodaysWorkout(exercises.map((e: { name: string; sets: number; reps: number }) => ({
          name: e.name,
          sets: e.sets,
          reps: e.reps,
        })));
      }
    }
  }, [showEmptyHistory]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Ready to train?</h1>

      <Card className="flex flex-col gap-4">
        <h2 className="font-semibold text-lg">Today&apos;s Workout</h2>
        <div className="flex flex-col gap-2">
          {todaysWorkout.map((exercise) => (
            <div
              key={exercise.name}
              className="flex items-center justify-between py-2 border-b border-muted-light last:border-0"
            >
              <span className="font-medium">{exercise.name}</span>
              <span className="text-sm text-muted">
                {exercise.sets} sets × {exercise.reps} reps
              </span>
            </div>
          ))}
        </div>
        <Button
          onClick={() => router.push("/workout/queue")}
          className="w-full text-lg py-4"
        >
          Start Workout
        </Button>
      </Card>

      <div>
        <h2 className="font-semibold text-lg mb-4">Workout History</h2>
        {history.length === 0 ? (
          <Card>
            <p className="text-muted text-center">
              No workouts yet — let&apos;s get started!
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {history.slice(-5).reverse().map((entry) => {
              const totalReps = entry.exercises.reduce(
                (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.repsCompleted, 0),
                0
              );
              return (
                <Card key={entry.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{entry.date}</p>
                    <p className="text-sm text-muted">
                      {entry.exercises.map((e) => e.exerciseName).join(", ")}
                    </p>
                  </div>
                  <Badge variant="green">{totalReps} reps</Badge>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
