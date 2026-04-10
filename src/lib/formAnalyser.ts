import { Point, getElbowAngle, getShoulderAbductionAngle } from "./angles";

type FormRule = {
  check: (landmarks: Point[]) => string | null;
};

const RATE_LIMIT_MS = 5000;

function bicepCurlRules(): FormRule[] {
  return [
    {
      check(landmarks) {
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const leftElbow = landmarks[13];
        const rightElbow = landmarks[14];

        const leftDrift = Math.abs(leftElbow.x - leftShoulder.x);
        const rightDrift = Math.abs(rightElbow.x - rightShoulder.x);

        if (leftDrift > 0.08 || rightDrift > 0.08) {
          return "Keep your elbows tucked to your sides";
        }
        return null;
      },
    },
    {
      check(landmarks) {
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const leftElbow = landmarks[13];
        const rightElbow = landmarks[14];

        if (leftElbow.y < leftShoulder.y - 0.02 || rightElbow.y < rightShoulder.y - 0.02) {
          return "Slow down, don't swing the weight";
        }
        return null;
      },
    },
    {
      check(landmarks) {
        const leftAngle = getElbowAngle(landmarks, "left");
        const rightAngle = getElbowAngle(landmarks, "right");

        if (Math.abs(leftAngle - rightAngle) > 30) {
          return "Keep both arms moving together";
        }
        return null;
      },
    },
  ];
}

function lateralRaiseRules(): FormRule[] {
  return [
    {
      check(landmarks) {
        const shoulderAngle =
          (getShoulderAbductionAngle(landmarks, "left") +
            getShoulderAbductionAngle(landmarks, "right")) /
          2;

        if (shoulderAngle < 40) return null;

        const leftElbow = getElbowAngle(landmarks, "left");
        const rightElbow = getElbowAngle(landmarks, "right");
        const avgElbow = (leftElbow + rightElbow) / 2;

        if (avgElbow < 150) {
          return "Straighten your arms more";
        }
        return null;
      },
    },
    {
      check(landmarks) {
        const shoulderAngle =
          (getShoulderAbductionAngle(landmarks, "left") +
            getShoulderAbductionAngle(landmarks, "right")) /
          2;

        if (shoulderAngle > 110) {
          return "Don't raise above shoulder height";
        }
        return null;
      },
    },
    {
      check(landmarks) {
        const leftAngle = getShoulderAbductionAngle(landmarks, "left");
        const rightAngle = getShoulderAbductionAngle(landmarks, "right");

        if (Math.abs(leftAngle - rightAngle) > 20) {
          return "Raise both arms evenly";
        }
        return null;
      },
    },
  ];
}

function jumpingJackRules(): FormRule[] {
  return [
    {
      check(landmarks) {
        const leftAngle = getShoulderAbductionAngle(landmarks, "left");
        const rightAngle = getShoulderAbductionAngle(landmarks, "right");

        if (Math.abs(leftAngle - rightAngle) > 15) {
          return "Keep your arms even";
        }
        return null;
      },
    },
  ];
}

const EXERCISE_RULES: Record<string, () => FormRule[]> = {
  "Bicep Curls": bicepCurlRules,
  "Lateral Raises": lateralRaiseRules,
  "Jumping Jacks": jumpingJackRules,
};

export class FormAnalyser {
  private rules: FormRule[];
  private lastFeedback: Map<string, number> = new Map();

  constructor(exercise: string) {
    const getRules = EXERCISE_RULES[exercise] ?? (() => []);
    this.rules = getRules();
  }

  analyse(landmarks: Point[]): string[] {
    const now = Date.now();
    const issues: string[] = [];

    for (const rule of this.rules) {
      const message = rule.check(landmarks);
      if (message) {
        const lastTime = this.lastFeedback.get(message) ?? 0;
        if (now - lastTime > RATE_LIMIT_MS) {
          issues.push(message);
          this.lastFeedback.set(message, now);
        }
      }
    }

    return issues;
  }
}
