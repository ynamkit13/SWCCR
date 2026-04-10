import { describe, it, expect, beforeEach } from "vitest";
import { RepCounter } from "../repCounter";
import { Point } from "../angles";

function mockLandmarks(overrides: Record<number, { x: number; y: number }>): Point[] {
  const landmarks: Point[] = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  for (const [index, value] of Object.entries(overrides)) {
    landmarks[Number(index)] = { ...value, z: 0 };
  }
  return landmarks;
}

// Bicep curl: elbow angle ~160° (down) → ~40° (up) → ~160° (down) = 1 rep
function bicepCurlDown(): Point[] {
  return mockLandmarks({
    11: { x: 0.4, y: 0.3 }, // left shoulder
    12: { x: 0.6, y: 0.3 }, // right shoulder
    13: { x: 0.4, y: 0.5 }, // left elbow
    14: { x: 0.6, y: 0.5 }, // right elbow
    15: { x: 0.4, y: 0.7 }, // left wrist (arm straight = ~180°)
    16: { x: 0.6, y: 0.7 }, // right wrist
  });
}

function bicepCurlUp(): Point[] {
  return mockLandmarks({
    11: { x: 0.4, y: 0.3 }, // left shoulder
    12: { x: 0.6, y: 0.3 },
    13: { x: 0.4, y: 0.5 }, // left elbow
    14: { x: 0.6, y: 0.5 },
    15: { x: 0.38, y: 0.32 }, // left wrist (curled up = ~30°)
    16: { x: 0.62, y: 0.32 },
  });
}

// Lateral raise: shoulder abduction ~0° (down) → ~90° (up) = 1 rep
function lateralRaiseDown(): Point[] {
  return mockLandmarks({
    11: { x: 0.4, y: 0.3 },
    12: { x: 0.6, y: 0.3 },
    13: { x: 0.4, y: 0.5 }, // elbow below shoulder (arm at side)
    14: { x: 0.6, y: 0.5 },
    23: { x: 0.4, y: 0.6 }, // left hip
    24: { x: 0.6, y: 0.6 },
  });
}

function lateralRaiseUp(): Point[] {
  return mockLandmarks({
    11: { x: 0.4, y: 0.3 },
    12: { x: 0.6, y: 0.3 },
    13: { x: 0.2, y: 0.3 }, // elbow out to side (arm raised)
    14: { x: 0.8, y: 0.3 },
    23: { x: 0.4, y: 0.6 },
    24: { x: 0.6, y: 0.6 },
  });
}

describe("RepCounter", () => {
  describe("Bicep Curls", () => {
    let counter: RepCounter;

    beforeEach(() => {
      counter = new RepCounter("Bicep Curls");
    });

    it("starts at 0 reps", () => {
      expect(counter.count).toBe(0);
    });

    it("detects a bicep curl rep (down → up → down)", () => {
      // Start down (3+ frames)
      for (let i = 0; i < 5; i++) counter.update(bicepCurlDown());
      // Go up (3+ frames)
      for (let i = 0; i < 5; i++) counter.update(bicepCurlUp());
      // Come back down (3+ frames)
      for (let i = 0; i < 5; i++) counter.update(bicepCurlDown());

      expect(counter.count).toBe(1);
    });

    it("does not count a partial movement", () => {
      counter.update(bicepCurlDown());
      counter.update(bicepCurlDown());
      // Only go halfway, stay down
      counter.update(bicepCurlDown());

      expect(counter.count).toBe(0);
    });

    it("resets count", () => {
      // Do a full rep first
      for (let i = 0; i < 5; i++) counter.update(bicepCurlDown());
      for (let i = 0; i < 5; i++) counter.update(bicepCurlUp());
      for (let i = 0; i < 5; i++) counter.update(bicepCurlDown());
      counter.reset();
      expect(counter.count).toBe(0);
    });

    it("does NOT count reps when landmarks stay constant (sitting still)", () => {
      // Same exact position repeated many times — should never count
      const sitting = bicepCurlDown(); // arms at sides, sitting
      for (let i = 0; i < 100; i++) {
        counter.update(sitting);
      }
      expect(counter.count).toBe(0);
    });

    it("does NOT count reps from small angle jitter", () => {
      // Simulate jitter: angle oscillates slightly around 160° (down position)
      const slightlyBent = mockLandmarks({
        11: { x: 0.4, y: 0.3 },
        12: { x: 0.6, y: 0.3 },
        13: { x: 0.4, y: 0.5 },
        14: { x: 0.6, y: 0.5 },
        15: { x: 0.4, y: 0.68 }, // slightly different from full down
        16: { x: 0.6, y: 0.68 },
      });
      for (let i = 0; i < 50; i++) {
        counter.update(i % 2 === 0 ? bicepCurlDown() : slightlyBent);
      }
      expect(counter.count).toBe(0);
    });

    it("requires sustained position in each phase (minimum frames)", () => {
      // Single frame at "up" shouldn't count — need sustained hold
      for (let i = 0; i < 5; i++) counter.update(bicepCurlDown());
      counter.update(bicepCurlUp()); // only 1 frame at up
      for (let i = 0; i < 5; i++) counter.update(bicepCurlDown());
      expect(counter.count).toBe(0);
    });

    it("counts rep with sustained movement through full range", () => {
      // 5+ frames at down, 5+ frames at up, 5+ frames at down = 1 rep
      for (let i = 0; i < 5; i++) counter.update(bicepCurlDown());
      for (let i = 0; i < 5; i++) counter.update(bicepCurlUp());
      for (let i = 0; i < 5; i++) counter.update(bicepCurlDown());
      expect(counter.count).toBe(1);
    });
  });

  describe("Lateral Raises", () => {
    let counter: RepCounter;

    beforeEach(() => {
      counter = new RepCounter("Lateral Raises");
    });

    it("detects a lateral raise rep (down → up → down)", () => {
      for (let i = 0; i < 5; i++) counter.update(lateralRaiseDown());
      for (let i = 0; i < 5; i++) counter.update(lateralRaiseUp());
      for (let i = 0; i < 5; i++) counter.update(lateralRaiseDown());

      expect(counter.count).toBe(1);
    });
  });
});
