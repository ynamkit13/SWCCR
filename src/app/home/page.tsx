"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";

const todaysWorkout = [
  { name: "Bicep Curls", sets: 3, reps: 10 },
  { name: "Lateral Raises", sets: 3, reps: 12 },
  { name: "Jumping Jacks", sets: 3, reps: 20 },
];

const mockHistory = [
  {
    date: "2026-04-08",
    exercises: ["Bicep Curls", "Lateral Raises"],
    totalReps: 66,
  },
  {
    date: "2026-04-06",
    exercises: ["Jumping Jacks", "Bicep Curls"],
    totalReps: 90,
  },
];

export default function HomePage({
  showEmptyHistory = false,
}: {
  showEmptyHistory?: boolean;
}) {
  const router = useRouter();
  const history = showEmptyHistory ? [] : mockHistory;

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
            {history.map((entry) => (
              <Card key={entry.date} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{entry.date}</p>
                  <p className="text-sm text-muted">
                    {entry.exercises.join(", ")}
                  </p>
                </div>
                <Badge variant="green">{entry.totalReps} reps</Badge>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
