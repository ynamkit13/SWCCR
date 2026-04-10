"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

const defaultQueue = [
  { name: "Bicep Curls", sets: 3, reps: 10, rest: 60 },
  { name: "Lateral Raises", sets: 3, reps: 12, rest: 45 },
  { name: "Jumping Jacks", sets: 3, reps: 20, rest: 30 },
];

export default function QueuePage() {
  const router = useRouter();
  const [queue, setQueue] = useState(defaultQueue);

  function updateExercise(
    index: number,
    field: "sets" | "reps" | "rest",
    value: number
  ) {
    const updated = [...queue];
    updated[index] = { ...updated[index], [field]: value };
    setQueue(updated);
  }

  function removeExercise(index: number) {
    setQueue(queue.filter((_, i) => i !== index));
  }

  function moveExercise(index: number, direction: "up" | "down") {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= queue.length) return;
    const updated = [...queue];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setQueue(updated);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Your Workout
        </h1>
        <p className="text-muted text-sm">
          Customise your queue before starting.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {queue.map((exercise, i) => (
          <Card key={`${exercise.name}-${i}`} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3
                className="font-semibold text-lg"
                data-testid="exercise-name"
              >
                {exercise.name}
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() => moveExercise(i, "up")}
                  disabled={i === 0}
                  className="p-1 text-muted hover:text-foreground disabled:opacity-30 cursor-pointer"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveExercise(i, "down")}
                  disabled={i === queue.length - 1}
                  className="p-1 text-muted hover:text-foreground disabled:opacity-30 cursor-pointer"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  onClick={() => removeExercise(i)}
                  className="p-1 text-error hover:text-red-700 cursor-pointer"
                  aria-label="Remove"
                >
                  ✕
                </button>
              </div>
            </div>

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

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => router.back()} className="flex-1">
          Back
        </Button>
        <Button className="flex-1 text-lg py-4">Start Workout</Button>
      </div>
    </div>
  );
}
