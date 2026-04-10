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

describe("FormAnalyser", () => {
  let analyser: FormAnalyser;

  beforeEach(() => {
    analyser = new FormAnalyser("Bicep Curls");
  });

  it("returns no issues for good form", () => {
    // Good bicep curl: elbows stable, arms symmetrical
    const landmarks = mockLandmarks({
      11: { x: 0.4, y: 0.3 }, // left shoulder
      12: { x: 0.6, y: 0.3 }, // right shoulder
      13: { x: 0.4, y: 0.5 }, // left elbow directly below shoulder
      14: { x: 0.6, y: 0.5 }, // right elbow directly below shoulder
      15: { x: 0.38, y: 0.35 }, // left wrist
      16: { x: 0.62, y: 0.35 }, // right wrist
    });
    const issues = analyser.analyse(landmarks);
    expect(issues).toHaveLength(0);
  });

  it("detects elbows drifting forward in bicep curls", () => {
    // Bad form: elbow moved forward of shoulder
    const landmarks = mockLandmarks({
      11: { x: 0.4, y: 0.3 },
      12: { x: 0.6, y: 0.3 },
      13: { x: 0.3, y: 0.5 }, // left elbow drifted forward
      14: { x: 0.7, y: 0.5 }, // right elbow drifted forward
      15: { x: 0.25, y: 0.35 },
      16: { x: 0.75, y: 0.35 },
    });
    const issues = analyser.analyse(landmarks);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]).toMatch(/elbow/i);
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
    expect(second).toHaveLength(0); // rate limited
  });
});

describe("FormAnalyser - Lateral Raises", () => {
  it("detects bent arms during lateral raises", () => {
    const analyser = new FormAnalyser("Lateral Raises");
    // Bad form: elbows too bent during raise
    const landmarks = mockLandmarks({
      11: { x: 0.4, y: 0.3 },
      12: { x: 0.6, y: 0.3 },
      13: { x: 0.25, y: 0.3 }, // left elbow out to side (raised)
      14: { x: 0.75, y: 0.3 },
      15: { x: 0.3, y: 0.15 }, // wrist bent up (elbow angle < 150°)
      16: { x: 0.7, y: 0.15 },
      23: { x: 0.4, y: 0.6 },
      24: { x: 0.6, y: 0.6 },
    });
    const issues = analyser.analyse(landmarks);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]).toMatch(/arm/i);
  });
});
