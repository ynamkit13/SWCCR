import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import WorkoutSession from "../page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
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

describe("Workout Session Screen", () => {
  it("renders the current exercise name", () => {
    render(<WorkoutSession />);
    expect(screen.getByText("Bicep Curls")).toBeInTheDocument();
  });

  it("renders the current set info", () => {
    render(<WorkoutSession />);
    expect(screen.getByText(/set 1 of 3/i)).toBeInTheDocument();
  });

  it("renders the webcam component", () => {
    render(<WorkoutSession />);
    expect(screen.getByTestId("webcam-mock")).toBeInTheDocument();
  });
});
