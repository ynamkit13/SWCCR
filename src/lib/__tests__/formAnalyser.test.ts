import { describe, it, expect, beforeEach } from "vitest";
import { FormAnalyser } from "../formAnalyser";
import { Point } from "../angles";

function mockLandmarks(overrides: Record<number, { x: number; y: number }>): Point[] {
  const landmarks: Point[] = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  for (const [index, value] of Object.entries(overrides)) {
    landmarks[Number(index)] = { ...value, z: 0 };
  }
  return landmarks;
}

// MediaPipe landmark indices for reference:
// 11=L shoulder, 12=R shoulder, 13=L elbow, 14=R elbow, 15=L wrist, 16=R wrist
// 23=L hip, 24=R hip, 25=L knee, 26=R knee, 27=L ankle, 28=R ankle

describe("FormAnalyser - Bicep Curls", () => {
  let analyser: FormAnalyser;

  beforeEach(() => {
    analyser = new FormAnalyser("Bicep Curls");
  });

  it("returns no issues for good form", () => {
    const landmarks = mockLandmarks({
      11: { x: 0.4, y: 0.3 },
      12: { x: 0.6, y: 0.3 },
      13: { x: 0.4, y: 0.5 },
      14: { x: 0.6, y: 0.5 },
      15: { x: 0.38, y: 0.35 },
      16: { x: 0.62, y: 0.35 },
      23: { x: 0.4, y: 0.7 },
      24: { x: 0.6, y: 0.7 },
    });
    const issues = analyser.analyse(landmarks);
    expect(issues).toHaveLength(0);
  });

  it("detects elbows drifting forward", () => {
    const landmarks = mockLandmarks({
      11: { x: 0.4, y: 0.3 },
      12: { x: 0.6, y: 0.3 },
      13: { x: 0.3, y: 0.5 },
      14: { x: 0.7, y: 0.5 },
      15: { x: 0.25, y: 0.35 },
      16: { x: 0.75, y: 0.35 },
    });
    const issues = analyser.analyse(landmarks);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]).toMatch(/elbow/i);
  });

  it("detects swinging / momentum (elbows rising above shoulders)", () => {
    const landmarks = mockLandmarks({
      11: { x: 0.4, y: 0.3 },
      12: { x: 0.6, y: 0.3 },
      13: { x: 0.4, y: 0.25 },
      14: { x: 0.6, y: 0.25 },
      15: { x: 0.38, y: 0.2 },
      16: { x: 0.62, y: 0.2 },
    });
    const issues = analyser.analyse(landmarks);
    expect(issues.some((i) => /slow|swing|momentum/i.test(i))).toBe(true);
  });

  it("detects asymmetric curl", () => {
    const landmarks = mockLandmarks({
      11: { x: 0.4, y: 0.3 },
      12: { x: 0.6, y: 0.3 },
      13: { x: 0.4, y: 0.5 },
      14: { x: 0.6, y: 0.5 },
      15: { x: 0.38, y: 0.32 },
      16: { x: 0.6, y: 0.7 },
    });
    const issues = analyser.analyse(landmarks);
    expect(issues.some((i) => /both arms|together|even/i.test(i))).toBe(true);
  });

  it("detects leaning back", () => {
    // Shoulders behind hips = leaning back
    const landmarks = mockLandmarks({
      11: { x: 0.3, y: 0.3 },  // shoulders shifted well back
      12: { x: 0.5, y: 0.3 },
      13: { x: 0.3, y: 0.5 },
      14: { x: 0.5, y: 0.5 },
      15: { x: 0.3, y: 0.35 },
      16: { x: 0.5, y: 0.35 },
      23: { x: 0.5, y: 0.7 },  // hips centered
      24: { x: 0.6, y: 0.7 },
    });
    const issues = analyser.analyse(landmarks);
    expect(issues.some((i) => /lean|upright|back/i.test(i))).toBe(true);
  });

  it("detects shoulders shrugging", () => {
    // Shoulders creeping up toward ears (Y getting smaller = higher)
    const landmarks = mockLandmarks({
      11: { x: 0.4, y: 0.2 },  // shoulders very high
      12: { x: 0.6, y: 0.2 },
      13: { x: 0.4, y: 0.5 },
      14: { x: 0.6, y: 0.5 },
      15: { x: 0.38, y: 0.35 },
      16: { x: 0.62, y: 0.35 },
      23: { x: 0.4, y: 0.7 },
      24: { x: 0.6, y: 0.7 },
    });
    const issues = analyser.analyse(landmarks);
    expect(issues.some((i) => /shoulder|shrug|relax/i.test(i))).toBe(true);
  });

  it("rate limits repeated feedback", () => {
    const badLandmarks = mockLandmarks({
      11: { x: 0.4, y: 0.3 },
      12: { x: 0.6, y: 0.3 },
      13: { x: 0.3, y: 0.5 },
      14: { x: 0.7, y: 0.5 },
      15: { x: 0.25, y: 0.35 },
      16: { x: 0.75, y: 0.35 },
    });

    const first = analyser.analyse(badLandmarks);
    const second = analyser.analyse(badLandmarks);

    expect(first.length).toBeGreaterThan(0);
    expect(second).toHaveLength(0);
  });
});

describe("FormAnalyser - Lateral Raises", () => {
  let analyser: FormAnalyser;

  beforeEach(() => {
    analyser = new FormAnalyser("Lateral Raises");
  });

  it("detects bent arms during lateral raises", () => {
    const landmarks = mockLandmarks({
      11: { x: 0.4, y: 0.3 },
      12: { x: 0.6, y: 0.3 },
      13: { x: 0.25, y: 0.3 },
      14: { x: 0.75, y: 0.3 },
      15: { x: 0.3, y: 0.15 },
      16: { x: 0.7, y: 0.15 },
      23: { x: 0.4, y: 0.6 },
      24: { x: 0.6, y: 0.6 },
    });
    const issues = analyser.analyse(landmarks);
    expect(issues.some((i) => /straighten|arm/i.test(i))).toBe(true);
  });

  it("detects raising too high", () => {
    const landmarks = mockLandmarks({
      11: { x: 0.4, y: 0.3 },
      12: { x: 0.6, y: 0.3 },
      13: { x: 0.15, y: 0.15 },
      14: { x: 0.85, y: 0.15 },
      15: { x: 0.1, y: 0.1 },
      16: { x: 0.9, y: 0.1 },
      23: { x: 0.4, y: 0.6 },
      24: { x: 0.6, y: 0.6 },
    });
    const issues = analyser.analyse(landmarks);
    expect(issues.some((i) => /above|shoulder|high/i.test(i))).toBe(true);
  });

  it("detects asymmetric raise", () => {
    const landmarks = mockLandmarks({
      11: { x: 0.4, y: 0.3 },
      12: { x: 0.6, y: 0.3 },
      13: { x: 0.2, y: 0.3 },
      14: { x: 0.6, y: 0.5 },
      15: { x: 0.15, y: 0.28 },
      16: { x: 0.6, y: 0.7 },
      23: { x: 0.4, y: 0.6 },
      24: { x: 0.6, y: 0.6 },
    });
    const issues = analyser.analyse(landmarks);
    expect(issues.some((i) => /even|both|symmetr/i.test(i))).toBe(true);
  });

  it("detects arching lower back", () => {
    const landmarks = mockLandmarks({
      11: { x: 0.3, y: 0.3 },  // shoulders shifted back
      12: { x: 0.5, y: 0.3 },
      13: { x: 0.2, y: 0.3 },
      14: { x: 0.8, y: 0.3 },
      15: { x: 0.15, y: 0.28 },
      16: { x: 0.85, y: 0.28 },
      23: { x: 0.5, y: 0.6 },  // hips centered
      24: { x: 0.6, y: 0.6 },
    });
    const issues = analyser.analyse(landmarks);
    expect(issues.some((i) => /lean|back|upright/i.test(i))).toBe(true);
  });

  it("detects shrugging shoulders", () => {
    // Arms raised to shoulder height, but shoulders shrugging up
    const landmarks = mockLandmarks({
      11: { x: 0.4, y: 0.2 },  // shoulders very high
      12: { x: 0.6, y: 0.2 },
      13: { x: 0.2, y: 0.22 },  // elbows at shoulder height
      14: { x: 0.8, y: 0.22 },
      15: { x: 0.1, y: 0.2 },
      16: { x: 0.9, y: 0.2 },
      23: { x: 0.4, y: 0.7 },
      24: { x: 0.6, y: 0.7 },
    });
    const issues = analyser.analyse(landmarks);
    expect(issues.some((i) => /shoulder|shrug|relax/i.test(i))).toBe(true);
  });

  it("detects elbows dropping below wrists", () => {
    // When arms are raised, elbows should be >= wrist height
    const landmarks = mockLandmarks({
      11: { x: 0.4, y: 0.3 },
      12: { x: 0.6, y: 0.3 },
      13: { x: 0.25, y: 0.35 },  // elbows lower (higher Y)
      14: { x: 0.75, y: 0.35 },
      15: { x: 0.15, y: 0.25 },  // wrists higher (lower Y)
      16: { x: 0.85, y: 0.25 },
      23: { x: 0.4, y: 0.6 },
      24: { x: 0.6, y: 0.6 },
    });
    const issues = analyser.analyse(landmarks);
    expect(issues.some((i) => /elbow|wrist|lead/i.test(i))).toBe(true);
  });
});

describe("FormAnalyser - Jumping Jacks", () => {
  let analyser: FormAnalyser;

  beforeEach(() => {
    analyser = new FormAnalyser("Jumping Jacks");
  });

  it("detects asymmetric arms", () => {
    const landmarks = mockLandmarks({
      11: { x: 0.4, y: 0.3 },
      12: { x: 0.6, y: 0.3 },
      13: { x: 0.2, y: 0.3 },
      14: { x: 0.6, y: 0.5 },
      23: { x: 0.4, y: 0.6 },
      24: { x: 0.6, y: 0.6 },
    });
    const issues = analyser.analyse(landmarks);
    expect(issues.some((i) => /even|arms/i.test(i))).toBe(true);
  });

  it("detects landing with straight knees", () => {
    // Knees nearly straight (angle close to 180)
    const landmarks = mockLandmarks({
      11: { x: 0.4, y: 0.3 },
      12: { x: 0.6, y: 0.3 },
      13: { x: 0.4, y: 0.4 },
      14: { x: 0.6, y: 0.4 },
      23: { x: 0.42, y: 0.6 },
      24: { x: 0.58, y: 0.6 },
      25: { x: 0.42, y: 0.78 }, // knee straight below hip
      26: { x: 0.58, y: 0.78 },
      27: { x: 0.42, y: 0.95 }, // ankle straight below knee
      28: { x: 0.58, y: 0.95 },
    });
    const issues = analyser.analyse(landmarks);
    expect(issues.some((i) => /knee|bend|soft/i.test(i))).toBe(true);
  });

  it("detects arms not reaching overhead", () => {
    // Arms out to side but not overhead — wrists below shoulder Y
    const landmarks = mockLandmarks({
      11: { x: 0.4, y: 0.3 },
      12: { x: 0.6, y: 0.3 },
      13: { x: 0.2, y: 0.28 },  // elbows at shoulder height
      14: { x: 0.8, y: 0.28 },
      15: { x: 0.1, y: 0.3 },   // wrists at shoulder height, not overhead
      16: { x: 0.9, y: 0.3 },
      23: { x: 0.4, y: 0.6 },
      24: { x: 0.6, y: 0.6 },
      25: { x: 0.35, y: 0.78 },
      26: { x: 0.65, y: 0.78 },
      27: { x: 0.3, y: 0.95 },
      28: { x: 0.7, y: 0.95 },
    });
    const issues = analyser.analyse(landmarks);
    expect(issues.some((i) => /arm|overhead|higher|raise/i.test(i))).toBe(true);
  });

  it("detects leaning forward", () => {
    const landmarks = mockLandmarks({
      11: { x: 0.3, y: 0.3 },  // shoulders shifted forward
      12: { x: 0.5, y: 0.3 },
      13: { x: 0.3, y: 0.4 },
      14: { x: 0.5, y: 0.4 },
      23: { x: 0.45, y: 0.6 }, // hips centered
      24: { x: 0.6, y: 0.6 },
      25: { x: 0.45, y: 0.78 },
      26: { x: 0.6, y: 0.78 },
      27: { x: 0.45, y: 0.95 },
      28: { x: 0.6, y: 0.95 },
    });
    const issues = analyser.analyse(landmarks);
    expect(issues.some((i) => /lean|upright|posture/i.test(i))).toBe(true);
  });

  it("detects uneven foot landing", () => {
    // One ankle much higher than the other
    const landmarks = mockLandmarks({
      11: { x: 0.4, y: 0.3 },
      12: { x: 0.6, y: 0.3 },
      13: { x: 0.4, y: 0.4 },
      14: { x: 0.6, y: 0.4 },
      23: { x: 0.4, y: 0.6 },
      24: { x: 0.6, y: 0.6 },
      25: { x: 0.35, y: 0.78 },
      26: { x: 0.65, y: 0.78 },
      27: { x: 0.35, y: 0.9 },  // left ankle higher
      28: { x: 0.65, y: 0.98 }, // right ankle lower
    });
    const issues = analyser.analyse(landmarks);
    expect(issues.some((i) => /feet|land|even|level/i.test(i))).toBe(true);
  });

  it("detects legs not opening wide enough", () => {
    // Feet close together when arms are raised (should be wide)
    const landmarks = mockLandmarks({
      11: { x: 0.4, y: 0.3 },
      12: { x: 0.6, y: 0.3 },
      13: { x: 0.2, y: 0.15 },  // arms raised high
      14: { x: 0.8, y: 0.15 },
      15: { x: 0.3, y: 0.05 },
      16: { x: 0.7, y: 0.05 },
      23: { x: 0.45, y: 0.6 },
      24: { x: 0.55, y: 0.6 },
      25: { x: 0.46, y: 0.78 },
      26: { x: 0.54, y: 0.78 },
      27: { x: 0.47, y: 0.95 },  // feet very close together
      28: { x: 0.53, y: 0.95 },
    });
    const issues = analyser.analyse(landmarks);
    expect(issues.some((i) => /legs|feet|wider|spread/i.test(i))).toBe(true);
  });
});
