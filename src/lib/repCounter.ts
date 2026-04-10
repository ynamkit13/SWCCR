import { Point, getElbowAngle, getShoulderAbductionAngle } from "./angles";

type ExerciseName = "Bicep Curls" | "Lateral Raises" | "Jumping Jacks";
type Phase = "down" | "up";

type ExerciseConfig = {
  getAngle: (landmarks: Point[]) => number;
  downThreshold: number; // angle below/above this = "down" position
  upThreshold: number; // angle below/above this = "up" position
  direction: "flexion" | "abduction"; // flexion: smaller angle = up, abduction: larger angle = up
};

const EXERCISE_CONFIGS: Record<ExerciseName, ExerciseConfig> = {
  "Bicep Curls": {
    getAngle: (lm) => (getElbowAngle(lm, "left") + getElbowAngle(lm, "right")) / 2,
    downThreshold: 140,
    upThreshold: 60,
    direction: "flexion", // angle decreases when curling up
  },
  "Lateral Raises": {
    getAngle: (lm) =>
      (getShoulderAbductionAngle(lm, "left") + getShoulderAbductionAngle(lm, "right")) / 2,
    downThreshold: 30,
    upThreshold: 70,
    direction: "abduction", // angle increases when raising
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

  constructor(exercise: string) {
    this.config = EXERCISE_CONFIGS[exercise as ExerciseName] ?? EXERCISE_CONFIGS["Bicep Curls"];
  }

  get count(): number {
    return this._count;
  }

  update(landmarks: Point[]): void {
    const angle = this.config.getAngle(landmarks);

    if (this.config.direction === "flexion") {
      // Flexion: angle decreases when moving "up" (e.g., bicep curl)
      if (this.phase === "down" && angle < this.config.upThreshold) {
        this.phase = "up";
      } else if (this.phase === "up" && angle > this.config.downThreshold) {
        this.phase = "down";
        this._count++;
      }
    } else {
      // Abduction: angle increases when moving "up" (e.g., lateral raise)
      if (this.phase === "down" && angle > this.config.upThreshold) {
        this.phase = "up";
      } else if (this.phase === "up" && angle < this.config.downThreshold) {
        this.phase = "down";
        this._count++;
      }
    }
  }

  reset(): void {
    this._count = 0;
    this.phase = "down";
  }
}
