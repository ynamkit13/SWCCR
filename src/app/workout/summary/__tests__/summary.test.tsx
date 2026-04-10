import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SummaryPage from "../page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("Post-Workout Summary", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders a completion heading", () => {
    render(<SummaryPage />);
    expect(screen.getByText(/workout complete/i)).toBeInTheDocument();
  });

  it("renders the exercise list with sets and reps", () => {
    render(<SummaryPage />);
    expect(screen.getByText("Bicep Curls")).toBeInTheDocument();
    expect(screen.getByText("Lateral Raises")).toBeInTheDocument();
    expect(screen.getByText("Jumping Jacks")).toBeInTheDocument();
  });

  it("displays total stats", () => {
    render(<SummaryPage />);
    // Stats are split: number in one element, label in another
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    // Labels exist (Exercises appears twice: stat + section heading)
    expect(screen.getAllByText("Exercises").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Sets")).toBeInTheDocument();
    expect(screen.getByText("Reps")).toBeInTheDocument();
  });

  it("renders AI coaching notes section", () => {
    render(<SummaryPage />);
    expect(screen.getByText(/coaching notes/i)).toBeInTheDocument();
  });

  it("navigates to home when Back to Home is clicked", async () => {
    render(<SummaryPage />);
    await userEvent.click(screen.getByRole("button", { name: /back to home/i }));
    expect(mockPush).toHaveBeenCalledWith("/home");
  });
});
