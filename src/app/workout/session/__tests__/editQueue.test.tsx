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
}));

describe("Edit Queue Mid-Session", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("shows a pause/settings button during workout", () => {
    render(<WorkoutSession />);
    expect(screen.getByRole("button", { name: /edit workout/i })).toBeInTheDocument();
  });

  it("opens edit panel showing remaining exercises", async () => {
    render(<WorkoutSession />);
    await userEvent.click(screen.getByRole("button", { name: /edit workout/i }));
    // Edit panel has heading "Edit Workout" and exercise names
    expect(screen.getByText("Edit Workout")).toBeInTheDocument();
    expect(screen.getByText("Lateral Raises")).toBeInTheDocument();
    expect(screen.getByText("Jumping Jacks")).toBeInTheDocument();
  });

  it("shows editable reps inputs for exercises", async () => {
    render(<WorkoutSession />);
    await userEvent.click(screen.getByRole("button", { name: /edit workout/i }));
    const repsInputs = screen.getAllByLabelText(/reps/i);
    expect(repsInputs.length).toBeGreaterThanOrEqual(3);
    expect(repsInputs[0]).toHaveAttribute("type", "number");
  });

  it("has an End Workout button that navigates to summary", async () => {
    render(<WorkoutSession />);
    await userEvent.click(screen.getByRole("button", { name: /edit workout/i }));
    await userEvent.click(screen.getByRole("button", { name: /end workout/i }));
    expect(mockPush).toHaveBeenCalledWith("/workout/summary");
  });
});
