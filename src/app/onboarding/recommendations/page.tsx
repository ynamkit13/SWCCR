"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { saveUserProfile } from "@/lib/storage";

type Exercise = { name: string; sets: number; reps: number; rest: number };

function getRecommendations(answers: { experience: string; frequency: string; goal: string } | null): Exercise[] {
  if (!answers) {
    return [
      { name: "Bicep Curls", sets: 3, reps: 10, rest: 60 },
      { name: "Lateral Raises", sets: 3, reps: 12, rest: 45 },
      { name: "Jumping Jacks", sets: 3, reps: 20, rest: 30 },
    ];
  }

  const isNew = answers.experience === "Never";
  const isAdvanced = answers.experience === "1+ years";
  const wantsStrength = answers.goal === "Build strength";

  const baseSets = isNew ? 2 : isAdvanced ? 4 : 3;
  const baseReps = wantsStrength ? (isNew ? 8 : 12) : (isNew ? 10 : 15);
  const baseRest = isNew ? 90 : isAdvanced ? 45 : 60;

  return [
    { name: "Bicep Curls", sets: baseSets, reps: baseReps, rest: baseRest },
    { name: "Lateral Raises", sets: baseSets, reps: baseReps + 2, rest: baseRest - 15 },
    { name: "Jumping Jacks", sets: baseSets, reps: baseReps + 10, rest: Math.max(30, baseRest - 30) },
  ];
}

export default function RecommendationsPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: "Bicep Curls", sets: 3, reps: 10, rest: 60 },
    { name: "Lateral Raises", sets: 3, reps: 12, rest: 45 },
    { name: "Jumping Jacks", sets: 3, reps: 20, rest: 30 },
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("quiz_answers");
      if (raw) {
        const answers = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reading from localStorage on mount
        setExercises(getRecommendations(answers));
      }
    }
  }, []);

  function updateExercise(
    index: number,
    field: "sets" | "reps" | "rest",
    value: number
  ) {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  }

  function handleConfirm() {
    // Save profile with defaults from first exercise
    const quizRaw = typeof window !== "undefined" ? localStorage.getItem("quiz_answers") : null;
    const quiz = quizRaw ? JSON.parse(quizRaw) : {};

    const fitnessLevelMap: Record<string, string> = {
      "Never": "never",
      "Under 6 months": "beginner",
      "1+ years": "intermediate",
    };
    const goalMap: Record<string, string> = {
      "Build strength": "strength",
      "Lose weight": "weight_loss",
      "Stay active": "active",
    };
    const freqMap: Record<string, number> = {
      "1–2": 2,
      "3–4": 4,
      "5+": 6,
    };

    saveUserProfile({
      fitnessLevel: fitnessLevelMap[quiz.experience] ?? "beginner",
      weeklyFrequency: freqMap[quiz.frequency] ?? 3,
      goal: goalMap[quiz.goal] ?? "active",
      defaultSets: exercises[0].sets,
      defaultReps: exercises[0].reps,
      defaultRestDuration: exercises[0].rest,
      onboardingComplete: true,
    });

    // Save recommended exercises for the queue
    if (typeof window !== "undefined") {
      localStorage.setItem("recommended_exercises", JSON.stringify(exercises));
    }

    router.push("/home");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <div className="text-center max-w-lg">
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Your Recommended Plan
        </h1>
        <p className="text-muted text-sm">
          These are recommended starting values. Adjust anything that doesn&apos;t
          feel right.
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {exercises.map((exercise, i) => (
          <Card key={exercise.name} className="flex flex-col gap-3">
            <h3 className="font-semibold text-lg">{exercise.name}</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor={`sets-${i}`}
                  className="block text-xs text-muted mb-1"
                >
                  Sets
                </label>
                <input
                  id={`sets-${i}`}
                  type="number"
                  min={1}
                  value={exercise.sets}
                  onChange={(e) =>
                    updateExercise(i, "sets", Number(e.target.value))
                  }
                  className="w-full rounded-lg border border-muted-light px-3 py-2 text-center text-base bg-background"
                />
              </div>
              <div>
                <label
                  htmlFor={`reps-${i}`}
                  className="block text-xs text-muted mb-1"
                >
                  Reps
                </label>
                <input
                  id={`reps-${i}`}
                  type="number"
                  min={1}
                  value={exercise.reps}
                  onChange={(e) =>
                    updateExercise(i, "reps", Number(e.target.value))
                  }
                  className="w-full rounded-lg border border-muted-light px-3 py-2 text-center text-base bg-background"
                />
              </div>
              <div>
                <label
                  htmlFor={`rest-${i}`}
                  className="block text-xs text-muted mb-1"
                >
                  Rest (s)
                </label>
                <input
                  id={`rest-${i}`}
                  type="number"
                  min={10}
                  step={5}
                  value={exercise.rest}
                  onChange={(e) =>
                    updateExercise(i, "rest", Number(e.target.value))
                  }
                  className="w-full rounded-lg border border-muted-light px-3 py-2 text-center text-base bg-background"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button
        onClick={handleConfirm}
        className="w-full max-w-md text-lg py-4"
      >
        Confirm
      </Button>
    </div>
  );
}
