import { describe, it, expect, vi } from "vitest";
import { createPoseDetector, PoseResult } from "../poseDetector";

// Mock @mediapipe/tasks-vision since it requires WASM files
vi.mock("@mediapipe/tasks-vision", () => {
  const mockDetect = vi.fn();
  return {
    PoseLandmarker: {
      createFromOptions: vi.fn().mockResolvedValue({
        detectForVideo: mockDetect,
        close: vi.fn(),
      }),
    },
    FilesetResolver: {
      forVisionTasks: vi.fn().mockResolvedValue({}),
    },
    __mockDetect: mockDetect,
  };
});

describe("PoseDetector", () => {
  it("initializes without error", async () => {
    const detector = await createPoseDetector();
    expect(detector).toBeDefined();
    expect(detector.detect).toBeInstanceOf(Function);
  });

  it("returns landmark data in expected format", async () => {
    const { __mockDetect } = await import("@mediapipe/tasks-vision") as any;
    __mockDetect.mockReturnValue({
      landmarks: [[
        ...Array.from({ length: 33 }, (_, i) => ({
          x: i / 33,
          y: i / 33,
          z: 0,
          visibility: 0.99,
        })),
      ]],
    });

    const detector = await createPoseDetector();
    const result = detector.detect({} as HTMLVideoElement, 0);
    expect(result).not.toBeNull();
    expect((result as PoseResult).landmarks).toHaveLength(33);
  });

  it("returns null when no person detected", async () => {
    const { __mockDetect } = await import("@mediapipe/tasks-vision") as any;
    __mockDetect.mockReturnValue({ landmarks: [] });

    const detector = await createPoseDetector();
    const result = detector.detect({} as HTMLVideoElement, 0);
    expect(result).toBeNull();
  });
});
