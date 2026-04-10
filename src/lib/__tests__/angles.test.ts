import { describe, it, expect } from "vitest";
import { calculateAngle, getElbowAngle, getShoulderAbductionAngle } from "../angles";

type Point = { x: number; y: number; z?: number };

describe("calculateAngle", () => {
  it("returns ~90 degrees for a right angle", () => {
    const a: Point = { x: 0, y: 1 };
    const b: Point = { x: 0, y: 0 }; // vertex
    const c: Point = { x: 1, y: 0 };
    const angle = calculateAngle(a, b, c);
    expect(angle).toBeCloseTo(90, 0);
  });

  it("returns ~180 degrees for a straight line", () => {
    const a: Point = { x: 0, y: 0 };
    const b: Point = { x: 1, y: 0 }; // vertex
    const c: Point = { x: 2, y: 0 };
    const angle = calculateAngle(a, b, c);
    expect(angle).toBeCloseTo(180, 0);
  });

  it("returns ~0 degrees for overlapping vectors", () => {
    const a: Point = { x: 1, y: 1 };
    const b: Point = { x: 0, y: 0 }; // vertex
    const c: Point = { x: 2, y: 2 }; // same direction as a from b
    const angle = calculateAngle(a, b, c);
    expect(angle).toBeCloseTo(0, 0);
  });

  it("returns ~45 degrees for a 45-degree angle", () => {
    const a: Point = { x: 0, y: 1 };
    const b: Point = { x: 0, y: 0 };
    const c: Point = { x: 1, y: 1 };
    const angle = calculateAngle(a, b, c);
    expect(angle).toBeCloseTo(45, 0);
  });

  it("works with MediaPipe normalized coordinates (0-1 range)", () => {
    const a: Point = { x: 0.5, y: 0.3, z: 0 };
    const b: Point = { x: 0.5, y: 0.5, z: 0 };
    const c: Point = { x: 0.7, y: 0.5, z: 0 };
    const angle = calculateAngle(a, b, c);
    expect(angle).toBeCloseTo(90, 0);
  });
});

describe("getElbowAngle", () => {
  it("returns elbow angle from shoulder, elbow, wrist landmarks", () => {
    // Simulate arm straight down (elbow ~180°)
    const landmarks = mockLandmarks({
      11: { x: 0.4, y: 0.3 }, // left shoulder
      13: { x: 0.4, y: 0.5 }, // left elbow
      15: { x: 0.4, y: 0.7 }, // left wrist
    });
    const angle = getElbowAngle(landmarks, "left");
    expect(angle).toBeCloseTo(180, 0);
  });

  it("returns ~90° for a bent arm", () => {
    const landmarks = mockLandmarks({
      11: { x: 0.4, y: 0.3 }, // left shoulder
      13: { x: 0.4, y: 0.5 }, // left elbow
      15: { x: 0.2, y: 0.5 }, // left wrist (bent 90°)
    });
    const angle = getElbowAngle(landmarks, "left");
    expect(angle).toBeCloseTo(90, 0);
  });
});

describe("getShoulderAbductionAngle", () => {
  it("returns ~0° when arm is at side", () => {
    const landmarks = mockLandmarks({
      11: { x: 0.4, y: 0.3 }, // left shoulder
      13: { x: 0.4, y: 0.5 }, // left elbow (straight down)
      23: { x: 0.4, y: 0.6 }, // left hip (below shoulder)
    });
    const angle = getShoulderAbductionAngle(landmarks, "left");
    expect(angle).toBeCloseTo(0, -1); // within 5 degrees
  });

  it("returns ~90° when arm is raised sideways", () => {
    const landmarks = mockLandmarks({
      11: { x: 0.4, y: 0.3 }, // left shoulder
      13: { x: 0.2, y: 0.3 }, // left elbow (out to side)
      23: { x: 0.4, y: 0.6 }, // left hip
    });
    const angle = getShoulderAbductionAngle(landmarks, "left");
    expect(angle).toBeCloseTo(90, 0);
  });
});

// Helper to create a sparse landmark array matching MediaPipe's 33-landmark format
function mockLandmarks(overrides: Record<number, { x: number; y: number }>): Point[] {
  const landmarks: Point[] = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  for (const [index, value] of Object.entries(overrides)) {
    landmarks[Number(index)] = { ...value, z: 0 };
  }
  return landmarks;
}
