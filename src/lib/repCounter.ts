import { Point, getElbowAngle, getShoulderAbductionAngle } from "./angles";

type ExerciseName = "Bicep Curls" | "Lateral Raises" | "Jumping Jacks";
type Phase = "down" | "up";

type ExerciseConfig = {
  getAngle: (landmarks: Point[]) => number;
  downThreshold: number;
  upThreshold: number;
  direction: "flexion" | "abduction";
};

// Minimum consecutive frames at a threshold before phase transition
const MIN_FRAMES_FOR_TRANSITION = 3;

const EXERCISE_CONFIGS: Record<ExerciseName, ExerciseConfig> = {
  "Bicep Curls": {
    getAngle: (lm) => (getElbowAngle(lm, "left") + getElbowAngle(lm, "right")) / 2,
    downThreshold: 140,
    upThreshold: 60,
    direction: "flexion",
  },
  "Lateral Raises": {
    getAngle: (lm) =>
      (getShoulderAbductionAngle(lm, "left") + getShoulderAbductionAngle(lm, "right")) / 2,
    downThreshold: 30,
    upThreshold: 70,
    direction: "abduction",
  },
  "Jumping Jacks": {
    getAngle: (lm) =>
      (getShoulderAbductionAngle(lm, "left") + getShoulderAbductionAngle(lm, "right")) / 2,
    downThreshold: 30,
    upThreshold: 70,
    direction: "abduction",
  },
};

export class RepCounter {
  private phase: Phase = "down";
  private _count: number = 0;
  private config: ExerciseConfig;
  private framesAtCandidate: number = 0; // consecutive frames meeting the next phase threshold
  private candidatePhase: Phase | null = null;

  constructor(exercise: string) {
    this.config = EXERCISE_CONFIGS[exercise as ExerciseName] ?? EXERCISE_CONFIGS["Bicep Curls"];
  }

  get count(): number {
    return this._count;
  }

  update(landmarks: Point[]): void {
    const angle = this.config.getAngle(landmarks);
    const nextPhase = this.getNextPhase(angle);

    if (nextPhase !== null && nextPhase !== this.phase) {
      // Angle is in the range for the opposite phase
      if (this.candidatePhase === nextPhase) {
        this.framesAtCandidate++;
      } else {
        this.candidatePhase = nextPhase;
        this.framesAtCandidate = 1;
      }

      // Only transition after sustained frames
      if (this.framesAtCandidate >= MIN_FRAMES_FOR_TRANSITION) {
        if (nextPhase === "down" && this.phase === "up") {
          this._count++;
        }
        this.phase = nextPhase;
        this.candidatePhase = null;
        this.framesAtCandidate = 0;
      }
    } else {
      // Angle is NOT in the opposite phase's range — reset candidate
      this.candidatePhase = null;
      this.framesAtCandidate = 0;
    }
  }

  private getNextPhase(angle: number): Phase | null {
    if (this.config.direction === "flexion") {
      if (angle < this.config.upThreshold) return "up";
      if (angle > this.config.downThreshold) return "down";
    } else {
      if (angle > this.config.upThreshold) return "up";
      if (angle < this.config.downThreshold) return "down";
    }
    // In the dead zone between thresholds — no phase change
    return null;
  }

  reset(): void {
    this._count = 0;
    this.phase = "down";
    this.candidatePhase = null;
    this.framesAtCandidate = 0;
  }
}
