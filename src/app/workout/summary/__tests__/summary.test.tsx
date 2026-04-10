import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SummaryPage from "../page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/storage", () => ({
  getWorkoutLogs: vi.fn().mockReturnValue([
    {
      id: "1",
      date: "2026-04-10",
      exercises: [
        {
          exerciseName: "Bicep Curls",
          sets: [
            { setNumber: 1, repsCompleted: 10, formNotes: "Good form" },
            { setNumber: 2, repsCompleted: 10, formNotes: "Good form" },
            { setNumber: 3, repsCompleted: 10, formNotes: "Good form" },
          ],
        },
        {
          exerciseName: "Lateral Raises",
          sets: [
            { setNumber: 1, repsCompleted: 12, formNotes: "Good form" },
            { setNumber: 2, repsCompleted: 12, formNotes: "Good form" },
            { setNumber: 3, repsCompleted: 12, formNotes: "Good form" },
          ],
        },
        {
          exerciseName: "Jumping Jacks",
          sets: [
            { setNumber: 1, repsCompleted: 20, formNotes: "Good form" },
            { setNumber: 2, repsCompleted: 20, formNotes: "Good form" },
            { setNumber: 3, repsCompleted: 20, formNotes: "Good form" },
          ],
        },
      ],
      aiSummary: "",
    },
  ]),
}));

vi.mock("@/lib/aiCoaching", () => ({
  generateWorkoutSummary: vi.fn().mockResolvedValue("Great workout! Your form was consistent."),
}));

describe("Post-Workout Summary", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders a completion heading", () => {
    render(<SummaryPage />);
    expect(screen.getByRole("heading", { name: /workout complete/i })).toBeInTheDocument();
  });

  it("renders the exercise list", () => {
    render(<SummaryPage />);
    expect(screen.getByText("Bicep Curls")).toBeInTheDocument();
    expect(screen.getByText("Lateral Raises")).toBeInTheDocument();
    expect(screen.getByText("Jumping Jacks")).toBeInTheDocument();
  });

  it("displays total stats", () => {
    render(<SummaryPage />);
    // Stats render after useEffect loads from storage mock
    expect(screen.getAllByText("Exercises").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Sets")).toBeInTheDocument();
    expect(screen.getByText("Reps")).toBeInTheDocument();
  });

  it("renders coaching notes section", () => {
    render(<SummaryPage />);
    expect(screen.getByText(/coaching notes/i)).toBeInTheDocument();
  });

  it("navigates to home when Back to Home is clicked", async () => {
    render(<SummaryPage />);
    await userEvent.click(screen.getByRole("button", { name: /back to home/i }));
    expect(mockPush).toHaveBeenCalledWith("/home");
  });
});
