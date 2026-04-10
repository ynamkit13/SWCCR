"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Webcam } from "@/components/Webcam";
import { RepCounter } from "@/components/HUD/RepCounter";
import { MuteButton } from "@/components/HUD/MuteButton";
import { FormFeedback } from "@/components/HUD/FormFeedback";
import { Button } from "@/components/Button";

const defaultExercises = [
  { name: "Bicep Curls", sets: 3, reps: 10, rest: 60 },
  { name: "Lateral Raises", sets: 3, reps: 12, rest: 45 },
  { name: "Jumping Jacks", sets: 3, reps: 20, rest: 30 },
];

type Phase = "workout" | "rest";

export default function WorkoutSession() {
  const router = useRouter();
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep] = useState(0);
  const [muted, setMuted] = useState(false);
  const [feedback] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("workout");
  const [restSeconds, setRestSeconds] = useState(0);

  const exercise = defaultExercises[exerciseIndex];

  const advanceToNextSet = useCallback(() => {
    const isLastSet = currentSet >= exercise.sets;
    const isLastExercise = exerciseIndex >= defaultExercises.length - 1;

    if (isLastSet && isLastExercise) {
      // Workout complete
      router.push("/workout/summary");
      return;
    }

    if (isLastSet) {
      // Move to next exercise
      setExerciseIndex((i) => i + 1);
      setCurrentSet(1);
    } else {
      // Next set of same exercise
      setCurrentSet((s) => s + 1);
    }
    setPhase("workout");
  }, [currentSet, exercise.sets, exerciseIndex, router]);

  function completeSet() {
    setRestSeconds(exercise.rest);
    setPhase("rest");
  }

  function skipRest() {
    advanceToNextSet();
  }

  if (phase === "rest") {
    const isLastSet = currentSet >= exercise.sets;
    const nextExercise = isLastSet
      ? defaultExercises[exerciseIndex + 1]?.name ?? exercise.name
      : exercise.name;
    const nextSet = isLastSet ? 1 : currentSet + 1;

    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
        <p className="text-sm text-muted font-medium">Rest</p>
        <div className="text-center">
          <p className="text-8xl font-bold tracking-tight">{restSeconds}</p>
          <p className="text-muted text-sm mt-2">seconds remaining</p>
        </div>
        <p className="text-muted text-sm">
          Next: {nextExercise} — Set {nextSet}
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setRestSeconds((s) => s + 60)}>
            +1 min
          </Button>
          <Button onClick={skipRest} aria-label="Skip rest">
            Start
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-3rem)] flex flex-col">
      {/* Camera feed */}
      <Webcam className="absolute inset-0 w-full h-full" />

      {/* HUD overlay */}
      <div className="relative z-10 flex flex-col justify-between h-full p-4">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2">
            <h1 className="text-white text-xl font-bold">{exercise.name}</h1>
            <p className="text-white/70 text-sm">
              Set {currentSet} of {exercise.sets}
            </p>
          </div>
          <MuteButton muted={muted} onToggle={() => setMuted(!muted)} />
        </div>

        {/* Middle: form feedback */}
        <div className="flex justify-center">
          <FormFeedback message={feedback} />
        </div>

        {/* Bottom: rep counter + complete button */}
        <div className="flex flex-col items-center gap-4 pb-4">
          <RepCounter current={currentRep} target={exercise.reps} />
          <Button onClick={completeSet} className="w-48">
            Complete Set
          </Button>
        </div>
      </div>
    </div>
  );
}
