"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Webcam, WebcamHandle } from "@/components/Webcam";
import { SkeletonOverlay } from "@/components/SkeletonOverlay";
import { RepCounter as RepCounterHUD } from "@/components/HUD/RepCounter";
import { MuteButton } from "@/components/HUD/MuteButton";
import { FormFeedback } from "@/components/HUD/FormFeedback";
import { Button } from "@/components/Button";
import { RepCounter } from "@/lib/repCounter";
import { FormAnalyser } from "@/lib/formAnalyser";
import { createPoseDetector, PoseDetector } from "@/lib/poseDetector";
import { speak } from "@/lib/speech";
import { generateCoachingMessage } from "@/lib/aiCoaching";
import { Point } from "@/lib/angles";
import { saveWorkoutLog } from "@/lib/storage";

type Exercise = { name: string; sets: number; reps: number; rest: number };

const defaultExercises: Exercise[] = [
  { name: "Bicep Curls", sets: 3, reps: 10, rest: 60 },
  { name: "Lateral Raises", sets: 3, reps: 12, rest: 45 },
  { name: "Jumping Jacks", sets: 3, reps: 20, rest: 30 },
];

type Phase = "workout" | "rest";

type SetResult = {
  repsCompleted: number;
  formIssues: string[];
};

export default function WorkoutSession() {
  const router = useRouter();
  const webcamRef = useRef<WebcamHandle>(null);
  const detectorRef = useRef<PoseDetector | null>(null);
  const repCounterRef = useRef<RepCounter | null>(null);
  const formAnalyserRef = useRef<FormAnalyser | null>(null);
  const animFrameRef = useRef<number>(0);

  const [exercises] = useState<Exercise[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("recommended_exercises");
      if (saved) return JSON.parse(saved);
    }
    return defaultExercises;
  });

  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(0);
  const [muted, setMuted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("workout");
  const [landmarks, setLandmarks] = useState<Point[] | null>(null);
  const [poseReady, setPoseReady] = useState(false);
  const [restSeconds, setRestSeconds] = useState(0);
  const [coachingNote, setCoachingNote] = useState<string | null>(null);
  const [coachingLoading, setCoachingLoading] = useState(false);

  // Track results for logging
  const sessionResultsRef = useRef<{
    exercises: {
      name: string;
      sets: { setNumber: number; repsCompleted: number; formIssues: string[] }[];
    }[];
  }>({ exercises: [] });
  const currentFormIssuesRef = useRef<string[]>([]);

  const exercise = exercises[exerciseIndex];

  // Initialize pose detector
  useEffect(() => {
    let cancelled = false;
    createPoseDetector()
      .then((detector) => {
        if (!cancelled) {
          detectorRef.current = detector;
          setPoseReady(true);
        }
      })
      .catch((err) => {
        console.error("Failed to initialize pose detector:", err);
      });

    return () => {
      cancelled = true;
      detectorRef.current?.close();
    };
  }, []);

  // Initialize rep counter and form analyser when exercise changes
  useEffect(() => {
    repCounterRef.current = new RepCounter(exercise.name);
    formAnalyserRef.current = new FormAnalyser(exercise.name);
    currentFormIssuesRef.current = [];
  }, [exercise.name]);

  // Pose detection loop
  useEffect(() => {
    if (!poseReady || phase !== "workout") return;

    let lastTime = 0;

    function detectFrame() {
      const video = webcamRef.current?.getVideo();
      const detector = detectorRef.current;

      if (video && detector && video.readyState >= 2) {
        const now = performance.now();
        if (now - lastTime > 33) { // ~30fps
          lastTime = now;
          const result = detector.detect(video, now);

          if (result) {
            setLandmarks(result.landmarks);

            // Count reps
            if (repCounterRef.current) {
              repCounterRef.current.update(result.landmarks);
              setCurrentRep(repCounterRef.current.count);
            }

            // Check form
            if (formAnalyserRef.current) {
              const issues = formAnalyserRef.current.analyse(result.landmarks);
              if (issues.length > 0) {
                setFeedback(issues[0]);
                currentFormIssuesRef.current.push(...issues);
                if (!muted) {
                  speak(issues[0]);
                }
                // Clear feedback after 3 seconds
                setTimeout(() => setFeedback(null), 3000);
              }
            }
          } else {
            setLandmarks(null);
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(detectFrame);
    }

    animFrameRef.current = requestAnimationFrame(detectFrame);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [poseReady, phase, muted]);

  // Auto-complete set when rep target reached
  useEffect(() => {
    if (currentRep >= exercise.reps && phase === "workout") {
      completeSet();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRep, exercise.reps, phase]);

  // Rest timer countdown
  useEffect(() => {
    if (phase !== "rest" || restSeconds <= 0) return;
    const timer = setInterval(() => {
      setRestSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, restSeconds]);

  const completeSet = useCallback(() => {
    // Record set result
    const exIdx = exerciseIndex;
    const results = sessionResultsRef.current;
    if (!results.exercises[exIdx]) {
      results.exercises[exIdx] = { name: exercise.name, sets: [] };
    }
    results.exercises[exIdx].sets.push({
      setNumber: currentSet,
      repsCompleted: currentRep,
      formIssues: [...new Set(currentFormIssuesRef.current)],
    });

    // Fetch AI coaching
    setCoachingLoading(true);
    generateCoachingMessage({
      exercise: exercise.name,
      setNumber: currentSet,
      repsCompleted: currentRep,
      formIssues: [...new Set(currentFormIssuesRef.current)],
    }).then((msg) => {
      setCoachingNote(msg);
      setCoachingLoading(false);
    });

    // Reset for next set
    currentFormIssuesRef.current = [];
    setRestSeconds(exercise.rest);
    setPhase("rest");
    setLandmarks(null);
  }, [exercise, exerciseIndex, currentSet, currentRep]);

  function advanceToNextSet() {
    const isLastSet = currentSet >= exercise.sets;
    const isLastExercise = exerciseIndex >= exercises.length - 1;

    if (isLastSet && isLastExercise) {
      // Save workout log
      const results = sessionResultsRef.current;
      saveWorkoutLog({
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        exercises: results.exercises.map((ex) => ({
          exerciseName: ex.name,
          sets: ex.sets.map((s) => ({
            setNumber: s.setNumber,
            repsCompleted: s.repsCompleted,
            formNotes: s.formIssues.join(", ") || "Good form",
          })),
        })),
        aiSummary: "",
      });
      router.push("/workout/summary");
      return;
    }

    if (isLastSet) {
      setExerciseIndex((i) => i + 1);
      setCurrentSet(1);
    } else {
      setCurrentSet((s) => s + 1);
    }

    setCurrentRep(0);
    repCounterRef.current?.reset();
    setCoachingNote(null);
    setPhase("workout");
  }

  // Rest phase
  if (phase === "rest") {
    const isLastSet = currentSet >= exercise.sets;
    const nextExercise = isLastSet
      ? exercises[exerciseIndex + 1]?.name ?? exercise.name
      : exercise.name;
    const nextSet = isLastSet ? 1 : currentSet + 1;

    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
        {restSeconds > 0 ? (
          <>
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
              <Button onClick={advanceToNextSet} aria-label="Start now">
                Start Now
              </Button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight text-center">
              Ready for your next set?
            </h1>
            <p className="text-muted">
              Next: {nextExercise} — Set {nextSet}
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setRestSeconds(60)}>
                +1 min
              </Button>
              <Button onClick={advanceToNextSet} aria-label="Skip rest">
                Start
              </Button>
            </div>
          </>
        )}

        {coachingLoading && (
          <p className="text-sm text-muted animate-pulse">Getting coaching feedback...</p>
        )}
        {coachingNote && (
          <div className="bg-surface rounded-2xl shadow-sm p-4 w-full max-w-md">
            <h3 className="font-semibold text-sm mb-1">Coaching Note</h3>
            <p className="text-sm text-muted">{coachingNote}</p>
          </div>
        )}
      </div>
    );
  }

  // Workout phase
  return (
    <div className="relative w-full h-[calc(100vh-3rem)] flex flex-col">
      {/* Camera feed */}
      <Webcam ref={webcamRef} className="absolute inset-0 w-full h-full" />

      {/* Skeleton overlay */}
      <SkeletonOverlay
        landmarks={landmarks}
        width={1280}
        height={720}
        className="absolute inset-0 w-full h-full"
      />

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

        {/* Middle: form feedback + pose status */}
        <div className="flex flex-col items-center gap-2">
          <FormFeedback message={feedback} />
          {!poseReady && (
            <div className="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2">
              <p className="text-white/70 text-sm animate-pulse">Loading pose detection...</p>
            </div>
          )}
          {poseReady && !landmarks && (
            <div className="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2">
              <p className="text-white/70 text-sm">Stand in view of the camera</p>
            </div>
          )}
        </div>

        {/* Bottom: rep counter + manual complete */}
        <div className="flex flex-col items-center gap-4 pb-4">
          <RepCounterHUD current={currentRep} target={exercise.reps} />
          <Button
            onClick={completeSet}
            variant="secondary"
            className="text-sm opacity-70"
          >
            Complete Set Manually
          </Button>
        </div>
      </div>
    </div>
  );
}
