import {
  Point,
  getElbowAngle,
  getShoulderAbductionAngle,
  getKneeAngle,
  getTorsoLeanAngle,
} from "./angles";

type FormRule = {
  check: (landmarks: Point[]) => string | null;
};

const RATE_LIMIT_MS = 5000;

function bicepCurlRules(): FormRule[] {
  return [
    // Elbows drifting away from torso
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
    // Swinging / momentum — elbows rising above shoulders
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
    // Asymmetric curl — both arms should move together
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
    // Leaning back — torso should stay upright
    {
      check(landmarks) {
        const lean = getTorsoLeanAngle(landmarks);
        if (lean > 15) {
          return "Stay upright, don't lean back";
        }
        return null;
      },
    },
    // Shrugging shoulders — shoulders creeping up toward ears
    {
      check(landmarks) {
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const leftHip = landmarks[23];
        const rightHip = landmarks[24];

        // Measure shoulder-to-hip vertical distance
        // If shoulders are unusually close to top of frame relative to hips, they're shrugging
        const leftDist = leftHip.y - leftShoulder.y;
        const rightDist = rightHip.y - rightShoulder.y;
        const avgDist = (leftDist + rightDist) / 2;

        // If torso is very elongated (shoulders far from hips), they're shrugging
        if (avgDist > 0.45) {
          return "Relax your shoulders, don't shrug";
        }
        return null;
      },
    },
  ];
}

function lateralRaiseRules(): FormRule[] {
  return [
    // Arms not straight enough
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
    // Raising above shoulder height
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
    // Asymmetric raise
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
    // Arching lower back — torso should stay upright
    {
      check(landmarks) {
        const lean = getTorsoLeanAngle(landmarks);
        if (lean > 15) {
          return "Keep your back straight, don't lean";
        }
        return null;
      },
    },
    // Shrugging shoulders
    {
      check(landmarks) {
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const leftHip = landmarks[23];
        const rightHip = landmarks[24];

        const leftDist = leftHip.y - leftShoulder.y;
        const rightDist = rightHip.y - rightShoulder.y;
        const avgDist = (leftDist + rightDist) / 2;

        if (avgDist > 0.45) {
          return "Relax your shoulders, don't shrug";
        }
        return null;
      },
    },
    // Elbows dropping below wrists during the raise
    {
      check(landmarks) {
        const shoulderAngle =
          (getShoulderAbductionAngle(landmarks, "left") +
            getShoulderAbductionAngle(landmarks, "right")) /
          2;

        // Only check when arms are raised
        if (shoulderAngle < 40) return null;

        const leftElbow = landmarks[13];
        const rightElbow = landmarks[14];
        const leftWrist = landmarks[15];
        const rightWrist = landmarks[16];

        // Elbows should be at same height or higher than wrists (lower Y = higher)
        const leftDrop = leftElbow.y - leftWrist.y;
        const rightDrop = rightElbow.y - rightWrist.y;

        if (leftDrop > 0.03 || rightDrop > 0.03) {
          return "Lead with your elbows, not your wrists";
        }
        return null;
      },
    },
  ];
}

function jumpingJackRules(): FormRule[] {
  return [
    // Asymmetric arms
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
    // Landing with straight knees — need soft bend
    {
      check(landmarks) {
        const leftKnee = getKneeAngle(landmarks, "left");
        const rightKnee = getKneeAngle(landmarks, "right");
        const avgKnee = (leftKnee + rightKnee) / 2;

        if (avgKnee > 170) {
          return "Soften your knees when landing";
        }
        return null;
      },
    },
    // Arms not reaching overhead
    {
      check(landmarks) {
        const leftAbduction = getShoulderAbductionAngle(landmarks, "left");
        const rightAbduction = getShoulderAbductionAngle(landmarks, "right");
        const avgAbduction = (leftAbduction + rightAbduction) / 2;

        // Only check when arms are raised (above 60°) but not fully overhead
        if (avgAbduction > 60 && avgAbduction < 140) {
          const leftWrist = landmarks[15];
          const rightWrist = landmarks[16];
          const leftShoulder = landmarks[11];
          const rightShoulder = landmarks[12];

          // Wrists should be well above shoulders when arms are up
          const leftAbove = leftShoulder.y - leftWrist.y;
          const rightAbove = rightShoulder.y - rightWrist.y;

          if (leftAbove < 0.1 && rightAbove < 0.1) {
            return "Raise your arms fully overhead";
          }
        }
        return null;
      },
    },
    // Leaning forward
    {
      check(landmarks) {
        const lean = getTorsoLeanAngle(landmarks);
        if (lean > 15) {
          return "Stay upright, keep good posture";
        }
        return null;
      },
    },
    // Uneven foot landing
    {
      check(landmarks) {
        const leftAnkle = landmarks[27];
        const rightAnkle = landmarks[28];

        if (Math.abs(leftAnkle.y - rightAnkle.y) > 0.05) {
          return "Land with both feet level";
        }
        return null;
      },
    },
    // Legs not opening wide enough when arms are up
    {
      check(landmarks) {
        const leftAbduction = getShoulderAbductionAngle(landmarks, "left");
        const rightAbduction = getShoulderAbductionAngle(landmarks, "right");
        const avgAbduction = (leftAbduction + rightAbduction) / 2;

        // Only check when arms are raised (in the "open" phase)
        if (avgAbduction < 60) return null;

        const leftAnkle = landmarks[27];
        const rightAnkle = landmarks[28];
        const hipWidth = Math.abs(landmarks[23].x - landmarks[24].x);
        const feetWidth = Math.abs(leftAnkle.x - rightAnkle.x);

        // Feet should be wider than hips when arms are up
        if (feetWidth < hipWidth * 1.3) {
          return "Spread your legs wider";
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
