import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import HomePage from "../page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock storage
vi.mock("@/lib/storage", () => ({
  getWorkoutLogs: vi.fn().mockReturnValue([]),
}));

describe("Home Screen", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders a greeting", () => {
    render(<HomePage />);
    expect(screen.getByText(/ready to train/i)).toBeInTheDocument();
  });

  it("renders today's recommended workout", () => {
    render(<HomePage />);
    expect(screen.getByText("Bicep Curls")).toBeInTheDocument();
    expect(screen.getByText("Lateral Raises")).toBeInTheDocument();
    expect(screen.getByText("Jumping Jacks")).toBeInTheDocument();
  });

  it("renders a Start Workout button that navigates to queue", async () => {
    render(<HomePage />);
    const button = screen.getByRole("button", { name: /start workout/i });
    await userEvent.click(button);
    expect(mockPush).toHaveBeenCalledWith("/workout/queue");
  });

  it("renders workout history section", () => {
    render(<HomePage />);
    expect(screen.getByText(/workout history/i)).toBeInTheDocument();
  });

  it("shows empty state when no workout history exists", () => {
    render(<HomePage showEmptyHistory />);
    expect(screen.getByText(/no workouts yet/i)).toBeInTheDocument();
  });

  it("shows empty state with default (no logs in storage)", () => {
    render(<HomePage />);
    expect(screen.getByText(/no workouts yet/i)).toBeInTheDocument();
  });
});
