import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import WorkoutSession from "../page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock the Webcam component since we can't access camera in tests
vi.mock("@/components/Webcam", () => ({
  Webcam: ({ className }: { className?: string }) => (
    <div data-testid="webcam-mock" className={className}>
      Webcam Mock
    </div>
  ),
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
