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
  Webcam: ({ className }: { className?: string }) => (
    <div data-testid="webcam-mock" className={className}>
      Webcam Mock
    </div>
  ),
}));

describe("Workout Flow", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("shows a Complete Set button to advance", () => {
    render(<WorkoutSession />);
    expect(screen.getByRole("button", { name: /complete set/i })).toBeInTheDocument();
  });

  it("clicking Complete Set shows the rest timer", async () => {
    render(<WorkoutSession />);
    await userEvent.click(screen.getByRole("button", { name: /complete set/i }));
    // Rest timer should be visible
    expect(screen.getByText(/rest/i)).toBeInTheDocument();
  });

  it("after rest, next set begins", async () => {
    render(<WorkoutSession />);
    // Complete set 1
    await userEvent.click(screen.getByRole("button", { name: /complete set/i }));
    // Click Start to skip rest
    await userEvent.click(screen.getByRole("button", { name: /skip rest/i }));
    // Should be on set 2
    expect(screen.getByText(/set 2 of 3/i)).toBeInTheDocument();
  });

  it("after all sets, moves to next exercise", async () => {
    render(<WorkoutSession />);
    // Complete all 3 sets of Bicep Curls
    for (let i = 0; i < 3; i++) {
      await userEvent.click(screen.getByRole("button", { name: /complete set/i }));
      if (i < 2) {
        await userEvent.click(screen.getByRole("button", { name: /skip rest/i }));
      }
    }
    // After last set, should skip to next exercise rest
    await userEvent.click(screen.getByRole("button", { name: /skip rest/i }));
    expect(screen.getByText("Lateral Raises")).toBeInTheDocument();
    expect(screen.getByText(/set 1 of 3/i)).toBeInTheDocument();
  });

  it("after all exercises, navigates to summary", async () => {
    render(<WorkoutSession />);
    // 3 exercises × 3 sets each = 9 complete-set clicks
    const exercises = [
      { sets: 3 }, // Bicep Curls
      { sets: 3 }, // Lateral Raises
      { sets: 3 }, // Jumping Jacks
    ];
    for (let e = 0; e < exercises.length; e++) {
      for (let s = 0; s < exercises[e].sets; s++) {
        await userEvent.click(screen.getByRole("button", { name: /complete set/i }));
        // Every set completion goes to rest, click Start/skip to advance
        await userEvent.click(screen.getByRole("button", { name: /skip rest/i }));
      }
    }
    expect(mockPush).toHaveBeenCalledWith("/workout/summary");
  });
});
