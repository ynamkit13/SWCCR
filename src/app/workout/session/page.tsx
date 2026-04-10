"use client";

import { useState } from "react";
import { Webcam } from "@/components/Webcam";

const defaultExercises = [
  { name: "Bicep Curls", sets: 3, reps: 10, rest: 60 },
  { name: "Lateral Raises", sets: 3, reps: 12, rest: 45 },
  { name: "Jumping Jacks", sets: 3, reps: 20, rest: 30 },
];

export default function WorkoutSession() {
  const [exerciseIndex] = useState(0);
  const [currentSet] = useState(1);

  const exercise = defaultExercises[exerciseIndex];

  return (
    <div className="relative w-full h-[calc(100vh-3rem)] flex flex-col">
      {/* Camera feed - fills the background */}
      <Webcam className="absolute inset-0 w-full h-full" />

      {/* HUD overlay */}
      <div className="relative z-10 flex flex-col justify-between h-full p-4">
        {/* Top bar: exercise name + set info */}
        <div className="flex items-center justify-between">
          <div className="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2">
            <h1 className="text-white text-xl font-bold">{exercise.name}</h1>
            <p className="text-white/70 text-sm">
              Set {currentSet} of {exercise.sets}
            </p>
          </div>
        </div>

        {/* Bottom area - placeholder for rep counter and controls */}
        <div className="flex justify-center">
          <div className="bg-black/50 backdrop-blur-sm rounded-xl px-6 py-3">
            <p className="text-white/70 text-sm text-center">
              Rep counter will appear here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
