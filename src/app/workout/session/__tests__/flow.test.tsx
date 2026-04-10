import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import WorkoutSession from "../page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/Webcam", () => ({
  Webcam: vi.fn().mockImplementation(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_props: unknown, _ref: unknown) => <div data-testid="webcam-mock">Webcam Mock</div>
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

describe("Workout Flow", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("shows a Complete Set Manually button", () => {
    render(<WorkoutSession />);
    expect(screen.getByRole("button", { name: /complete set manually/i })).toBeInTheDocument();
  });

  it("clicking Complete Set Manually shows the rest timer", async () => {
    render(<WorkoutSession />);
    await userEvent.click(screen.getByRole("button", { name: /complete set manually/i }));
    expect(screen.getByText(/rest/i)).toBeInTheDocument();
  });

  it("shows rest timer with countdown after completing set", async () => {
    render(<WorkoutSession />);
    await userEvent.click(screen.getByRole("button", { name: /complete set manually/i }));
    // Should show the rest countdown
    expect(screen.getByText(/rest/i)).toBeInTheDocument();
    expect(screen.getByText(/seconds remaining/i)).toBeInTheDocument();
  });
});
