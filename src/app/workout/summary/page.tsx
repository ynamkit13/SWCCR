"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";

const mockResults = [
  { name: "Bicep Curls", sets: 3, reps: 10 },
  { name: "Lateral Raises", sets: 3, reps: 12 },
  { name: "Jumping Jacks", sets: 3, reps: 20 },
];

const totalExercises = mockResults.length;
const totalSets = mockResults.reduce((sum, e) => sum + e.sets, 0);
const totalReps = mockResults.reduce((sum, e) => sum + e.reps, 0);

const mockCoachingNotes =
  "Great job on your bicep curls! Your form was consistent across all sets. On lateral raises, try to keep your arms slightly bent at the elbow to reduce shoulder strain. Your jumping jacks had great energy — keep it up!";

export default function SummaryPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Workout Complete! 🎉
        </h1>
        <p className="text-muted">Here&apos;s how you did.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        <Card className="text-center">
          <p className="text-2xl font-bold text-primary">{totalExercises}</p>
          <p className="text-xs text-muted">Exercises</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-primary">{totalSets}</p>
          <p className="text-xs text-muted">Sets</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-primary">{totalReps}</p>
          <p className="text-xs text-muted">Reps</p>
        </Card>
      </div>

      <Card className="w-full max-w-md">
        <h2 className="font-semibold text-lg mb-3">Exercises</h2>
        <div className="flex flex-col gap-2">
          {mockResults.map((exercise) => (
            <div
              key={exercise.name}
              className="flex items-center justify-between py-2 border-b border-muted-light last:border-0"
            >
              <span className="font-medium">{exercise.name}</span>
              <Badge variant="green">
                {exercise.sets} × {exercise.reps}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="w-full max-w-md">
        <h2 className="font-semibold text-lg mb-2">Coaching Notes</h2>
        <p className="text-sm text-muted leading-relaxed">
          {mockCoachingNotes}
        </p>
      </Card>

      <Button
        onClick={() => router.push("/home")}
        className="w-full max-w-md text-lg py-4"
      >
        Back to Home
      </Button>
    </div>
  );
}
