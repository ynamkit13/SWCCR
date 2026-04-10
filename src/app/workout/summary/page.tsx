"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { getWorkoutLogs } from "@/lib/storage";
import { generateWorkoutSummary } from "@/lib/aiCoaching";

export default function SummaryPage() {
  const router = useRouter();
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [latestLog, setLatestLog] = useState<ReturnType<typeof getWorkoutLogs>[number] | null>(null);

  useEffect(() => {
    const logs = getWorkoutLogs();
    if (logs.length > 0) {
      setLatestLog(logs[logs.length - 1]);
    }
  }, []);

  const exercises = latestLog?.exercises ?? [];
  const totalExercises = exercises.length;
  const totalSets = exercises.reduce((sum, e) => sum + e.sets.length, 0);
  const totalReps = exercises.reduce(
    (sum, e) => sum + e.sets.reduce((s, set) => s + set.repsCompleted, 0),
    0
  );

  useEffect(() => {
    if (!latestLog || exercises.length === 0) {
      setAiSummary("Workout complete! Great job pushing through your session.");
      setLoading(false);
      return;
    }

    generateWorkoutSummary({
      exercises: exercises.map((ex) => ({
        name: ex.exerciseName,
        sets: ex.sets.length,
        repsPerSet: ex.sets.map((s) => s.repsCompleted),
        formIssues: ex.sets
          .map((s) => s.formNotes)
          .filter((n) => n && n !== "Good form"),
      })),
    }).then((summary) => {
      setAiSummary(summary);
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Workout Complete!
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

      {exercises.length > 0 && (
        <Card className="w-full max-w-md">
          <h2 className="font-semibold text-lg mb-3">Exercises</h2>
          <div className="flex flex-col gap-2">
            {exercises.map((ex) => {
              const reps = ex.sets.reduce((s, set) => s + set.repsCompleted, 0);
              return (
                <div
                  key={ex.exerciseName}
                  className="flex items-center justify-between py-2 border-b border-muted-light last:border-0"
                >
                  <span className="font-medium">{ex.exerciseName}</span>
                  <Badge variant="green">
                    {ex.sets.length} sets &middot; {reps} reps
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="w-full max-w-md">
        <h2 className="font-semibold text-lg mb-2">Coaching Notes</h2>
        {loading ? (
          <p className="text-sm text-muted animate-pulse">Generating AI summary...</p>
        ) : (
          <p className="text-sm text-muted leading-relaxed">{aiSummary}</p>
        )}
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
