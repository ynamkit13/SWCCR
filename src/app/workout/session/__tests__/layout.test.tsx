import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import WorkoutSession from "../page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/components/Webcam", () => ({
  Webcam: vi.fn().mockImplementation(
    () => <div data-testid="webcam-mock">Webcam Mock</div>
  ),
}));

vi.mock("@/components/SkeletonOverlay", () => ({
  SkeletonOverlay: () => <canvas data-testid="skeleton-mock" />,
}));

vi.mock("@/lib/poseDetector", () => ({
  createPoseDetector: vi.fn().mockResolvedValue({
    detect: vi.fn().mockReturnValue(null),
    close: vi.fn(),
  }),
}));

vi.mock("@/lib/aiCoaching", () => ({
  generateCoachingMessage: vi.fn().mockResolvedValue("Great set!"),
}));

vi.mock("@/lib/storage", () => ({
  saveWorkoutLog: vi.fn(),
  getWorkoutLogs: vi.fn().mockReturnValue([]),
}));

describe("Workout Layout", () => {
  it("renders side panel with exercise name", () => {
    render(<WorkoutSession />);
    expect(screen.getByTestId("side-panel")).toBeInTheDocument();
    expect(screen.getByText("Bicep Curls")).toBeInTheDocument();
  });

  it("renders camera and side panel as siblings", () => {
    render(<WorkoutSession />);
    expect(screen.getByTestId("camera-section")).toBeInTheDocument();
    expect(screen.getByTestId("side-panel")).toBeInTheDocument();
  });
});
