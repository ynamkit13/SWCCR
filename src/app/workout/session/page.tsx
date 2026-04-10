"use client";

import { useState } from "react";
import { Webcam } from "@/components/Webcam";
import { RepCounter } from "@/components/HUD/RepCounter";
import { MuteButton } from "@/components/HUD/MuteButton";
import { FormFeedback } from "@/components/HUD/FormFeedback";

const defaultExercises = [
  { name: "Bicep Curls", sets: 3, reps: 10, rest: 60 },
  { name: "Lateral Raises", sets: 3, reps: 12, rest: 45 },
  { name: "Jumping Jacks", sets: 3, reps: 20, rest: 30 },
];

export default function WorkoutSession() {
  const [exerciseIndex] = useState(0);
  const [currentSet] = useState(1);
  const [currentRep] = useState(0);
  const [muted, setMuted] = useState(false);
  const [feedback] = useState<string | null>(null);

  const exercise = defaultExercises[exerciseIndex];

  return (
    <div className="relative w-full h-[calc(100vh-3rem)] flex flex-col">
      {/* Camera feed - fills the background */}
      <Webcam className="absolute inset-0 w-full h-full" />

      {/* HUD overlay */}
      <div className="relative z-10 flex flex-col justify-between h-full p-4">
        {/* Top bar: exercise name + set info + mute */}
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

        {/* Bottom: rep counter */}
        <div className="flex justify-center pb-4">
          <RepCounter current={currentRep} target={exercise.reps} />
        </div>
      </div>
    </div>
  );
}
