"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "./Button";
import { Card } from "./Card";

type RestTimerProps = {
  duration: number;
  onComplete: () => void;
  nextExercise: string;
  nextSet: number;
  coachingNote?: string;
};

export function RestTimer({
  duration,
  onComplete,
  nextExercise,
  nextSet,
  coachingNote,
}: RestTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(duration);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFinished = secondsLeft <= 0;

  useEffect(() => {
    if (isFinished) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isFinished]);

  function addOneMinute() {
    setSecondsLeft((s) => s + 60);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      {isFinished ? (
        <>
          <h1 className="text-2xl font-bold tracking-tight text-center">
            Ready for your next set?
          </h1>
          <p className="text-muted">
            Up next: {nextExercise} — Set {nextSet}
          </p>
          <div className="flex gap-3 w-full max-w-sm">
            <Button variant="secondary" onClick={addOneMinute} className="flex-1">
              +1 min
            </Button>
            <Button onClick={onComplete} className="flex-1 text-lg">
              Start
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-muted font-medium">Rest</p>
          <div className="text-center">
            <p className="text-8xl font-bold tracking-tight">{secondsLeft}</p>
            <p className="text-muted text-sm mt-2">seconds remaining</p>
          </div>
          <p className="text-muted text-sm">
            Next: {nextExercise} — Set {nextSet}
          </p>
          <Button variant="secondary" onClick={addOneMinute}>
            +1 min
          </Button>
        </>
      )}

      {coachingNote && (
        <Card className="w-full max-w-md">
          <h3 className="font-semibold text-sm mb-1">Coaching Note</h3>
          <p className="text-sm text-muted">{coachingNote}</p>
        </Card>
      )}
    </div>
  );
}
