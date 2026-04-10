import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import WorkoutSession from "../page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
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
  getUserPreferences: vi.fn().mockReturnValue({ defaultMuted: false, audioDuckingEnabled: true }),
  saveUserPreferences: vi.fn(),
}));

describe("Rest Timer - Start Now", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("shows Start Now button during countdown", async () => {
    render(<WorkoutSession />);
    // Complete a set to enter rest phase
    await userEvent.click(screen.getByRole("button", { name: /complete set manually/i }));
    // Should show Start Now during countdown (timer > 0)
    expect(screen.getByRole("button", { name: /start now/i })).toBeInTheDocument();
  });

  it("clicking Start Now exits rest phase", async () => {
    render(<WorkoutSession />);
    await userEvent.click(screen.getByRole("button", { name: /complete set manually/i }));
    await userEvent.click(screen.getByRole("button", { name: /start now/i }));
    // Should be back in workout phase showing set 2
    expect(screen.getByText(/set 2 of 3/i)).toBeInTheDocument();
  });
});
