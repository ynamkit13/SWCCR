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
  const containerRef = useRef<HTMLDivElement>(null);
  const detectorRef = useRef<PoseDetector | null>(null);
  const repCounterRef = useRef<RepCounter | null>(null);
  const formAnalyserRef = useRef<FormAnalyser | null>(null);
  const animFrameRef = useRef<number>(0);

  const [exercises, setExercises] = useState<Exercise[]>(() => {
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
  const [containerSize, setContainerSize] = useState({ width: 1280, height: 720 });
  const [showEditPanel, setShowEditPanel] = useState(false);

  // Track results for logging
  const sessionResultsRef = useRef<{
    exercises: {
      name: string;
      sets: { setNumber: number; repsCompleted: number; formIssues: string[] }[];
    }[];
  }>({ exercises: [] });
  const currentFormIssuesRef = useRef<string[]>([]);

  const exercise = exercises[exerciseIndex];

  // Track container size for skeleton overlay
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width: Math.round(width), height: Math.round(height) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  // Workout phase — side-by-side layout
  return (
    <div className="flex h-[calc(100vh-3rem)] gap-0">
      {/* Camera section — 3/4 width */}
      <div ref={containerRef} data-testid="camera-section" className="relative w-3/4 h-full bg-black">
        <Webcam ref={webcamRef} className="absolute inset-0 w-full h-full" />
        <SkeletonOverlay
          landmarks={landmarks}
          width={containerSize.width}
          height={containerSize.height}
          mirrored
          className="absolute inset-0 w-full h-full"
        />
        {/* Form feedback overlay on camera */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
          <FormFeedback message={feedback} />
        </div>
        {/* Pose status overlay */}
        {!poseReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2">
              <p className="text-white/70 text-sm animate-pulse">Loading pose detection...</p>
            </div>
          </div>
        )}
        {poseReady && !landmarks && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2">
              <p className="text-white/70 text-sm">Stand in view of the camera</p>
            </div>
          </div>
        )}
      </div>

      {/* Side panel — 1/4 width */}
      <div data-testid="side-panel" className="w-1/4 h-full bg-surface flex flex-col justify-between p-5 border-l border-muted-light">
        {/* Exercise info */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-xl font-bold">{exercise.name}</h1>
            <p className="text-muted text-sm">
              Set {currentSet} of {exercise.sets}
            </p>
          </div>

          {/* Rep counter */}
          <div className="bg-background rounded-2xl p-4 text-center">
            <p className="text-5xl font-bold text-primary">{currentRep}</p>
            <p className="text-muted text-sm">/ {exercise.reps}</p>
            <p className="text-sm font-medium mt-1 text-primary">
              {currentRep >= exercise.reps
                ? "Set complete!"
                : `${exercise.reps - currentRep} more to go!`}
            </p>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <MuteButton muted={muted} onToggle={() => setMuted(!muted)} />
            <button
              onClick={() => setShowEditPanel(true)}
              aria-label="Edit workout"
              className="bg-background rounded-full w-11 h-11 flex items-center justify-center shadow-sm border border-muted-light hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom: manual complete */}
        <Button
          onClick={completeSet}
          variant="secondary"
          className="w-full text-sm"
        >
          Complete Set Manually
        </Button>
      </div>

      {/* Edit Panel Overlay */}
      {showEditPanel && (
        <div className="absolute inset-0 z-20 bg-background/95 overflow-y-auto p-6">
          <div className="max-w-md mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Edit Workout</h2>
              <button
                onClick={() => setShowEditPanel(false)}
                className="text-muted hover:text-foreground text-2xl cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {exercises.map((ex, i) => (
              <div key={ex.name} className="bg-surface rounded-2xl shadow-sm p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{ex.name}</h3>
                  {i === exerciseIndex && (
                    <span className="text-xs text-primary font-medium">Current</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label htmlFor={`edit-sets-${i}`} className="block text-xs text-muted mb-1">Sets</label>
                    <input
                      id={`edit-sets-${i}`}
                      type="number"
                      min={1}
                      value={ex.sets}
                      onChange={(e) => {
                        const updated = [...exercises];
                        updated[i] = { ...updated[i], sets: Number(e.target.value) };
                        setExercises(updated);
                      }}
                      className="w-full rounded-lg border border-muted-light px-3 py-2 text-center text-base bg-background"
                    />
                  </div>
                  <div>
                    <label htmlFor={`edit-reps-${i}`} className="block text-xs text-muted mb-1">Reps</label>
                    <input
                      id={`edit-reps-${i}`}
                      type="number"
                      min={1}
                      value={ex.reps}
                      onChange={(e) => {
                        const updated = [...exercises];
                        updated[i] = { ...updated[i], reps: Number(e.target.value) };
                        setExercises(updated);
                      }}
                      className="w-full rounded-lg border border-muted-light px-3 py-2 text-center text-base bg-background"
                    />
                  </div>
                  <div>
                    <label htmlFor={`edit-rest-${i}`} className="block text-xs text-muted mb-1">Rest (s)</label>
                    <input
                      id={`edit-rest-${i}`}
                      type="number"
                      min={10}
                      step={5}
                      value={ex.rest}
                      onChange={(e) => {
                        const updated = [...exercises];
                        updated[i] = { ...updated[i], rest: Number(e.target.value) };
                        setExercises(updated);
                      }}
                      className="w-full rounded-lg border border-muted-light px-3 py-2 text-center text-base bg-background"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowEditPanel(false)}
                className="flex-1"
              >
                Resume
              </Button>
              <Button
                onClick={() => {
                  // Save what we have and end workout
                  const results = sessionResultsRef.current;
                  saveWorkoutLog({
                    id: Date.now().toString(),
                    date: new Date().toISOString().split("T")[0],
                    exercises: results.exercises
                      .filter((ex) => ex.sets.length > 0)
                      .map((ex) => ({
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
                }}
                className="flex-1 bg-error hover:bg-red-600 text-white"
              >
                End Workout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
