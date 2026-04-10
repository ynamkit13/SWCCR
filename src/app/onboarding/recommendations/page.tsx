"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

const defaultExercises = [
  { name: "Bicep Curls", sets: 3, reps: 10, rest: 60 },
  { name: "Lateral Raises", sets: 3, reps: 12, rest: 45 },
  { name: "Jumping Jacks", sets: 3, reps: 20, rest: 30 },
];

export default function RecommendationsPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState(defaultExercises);

  function updateExercise(
    index: number,
    field: "sets" | "reps" | "rest",
    value: number
  ) {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <div className="text-center max-w-lg">
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Your Recommended Plan
        </h1>
        <p className="text-muted text-sm">
          These are AI-recommended starting values. Adjust anything that doesn't
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
        onClick={() => router.push("/home")}
        className="w-full max-w-md text-lg py-4"
      >
        Confirm
      </Button>
    </div>
  );
}
