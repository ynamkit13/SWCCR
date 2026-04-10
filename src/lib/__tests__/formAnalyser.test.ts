import { describe, it, expect, vi, beforeEach } from "vitest";
import { FormAnalyser } from "../formAnalyser";
import { Point } from "../angles";

function mockLandmarks(overrides: Record<number, { x: number; y: number }>): Point[] {
  const landmarks: Point[] = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  for (const [index, value] of Object.entries(overrides)) {
    landmarks[Number(index)] = { ...value, z: 0 };
  }
  return landmarks;
}

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
      19: { x: 0.37, y: 0.33 },
      20: { x: 0.63, y: 0.33 },
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
      13: { x: 0.4, y: 0.25 }, // elbow above shoulder
      14: { x: 0.6, y: 0.25 },
      15: { x: 0.38, y: 0.2 },
      16: { x: 0.62, y: 0.2 },
    });
    const issues = analyser.analyse(landmarks);
    expect(issues.some((i) => /slow|swing|momentum/i.test(i))).toBe(true);
  });

  it("detects asymmetric curl", () => {
    // Left arm bent at ~40°, right arm straight at ~170°
    const landmarks = mockLandmarks({
      11: { x: 0.4, y: 0.3 },
      12: { x: 0.6, y: 0.3 },
      13: { x: 0.4, y: 0.5 },
      14: { x: 0.6, y: 0.5 },
      15: { x: 0.38, y: 0.32 }, // left wrist curled up
      16: { x: 0.6, y: 0.7 },  // right wrist straight down
    });
    const issues = analyser.analyse(landmarks);
    expect(issues.some((i) => /both arms|together|even/i.test(i))).toBe(true);
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
      13: { x: 0.15, y: 0.15 }, // arms way above shoulder
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
      13: { x: 0.2, y: 0.3 }, // left arm raised
      14: { x: 0.6, y: 0.5 }, // right arm down
      15: { x: 0.15, y: 0.28 },
      16: { x: 0.6, y: 0.7 },
      23: { x: 0.4, y: 0.6 },
      24: { x: 0.6, y: 0.6 },
    });
    const issues = analyser.analyse(landmarks);
    expect(issues.some((i) => /even|both|symmetr/i.test(i))).toBe(true);
  });
});

describe("FormAnalyser - Jumping Jacks", () => {
  it("detects asymmetric arms", () => {
    const analyser = new FormAnalyser("Jumping Jacks");
    const landmarks = mockLandmarks({
      11: { x: 0.4, y: 0.3 },
      12: { x: 0.6, y: 0.3 },
      13: { x: 0.2, y: 0.3 }, // left arm raised
      14: { x: 0.6, y: 0.5 }, // right arm down
      23: { x: 0.4, y: 0.6 },
      24: { x: 0.6, y: 0.6 },
    });
    const issues = analyser.analyse(landmarks);
    expect(issues.some((i) => /even|arms/i.test(i))).toBe(true);
  });
});
