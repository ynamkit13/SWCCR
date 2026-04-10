import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RecommendationsPage from "../page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("AI Recommendations Review", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders all mock exercises", () => {
    render(<RecommendationsPage />);
    expect(screen.getByText("Bicep Curls")).toBeInTheDocument();
    expect(screen.getByText("Lateral Raises")).toBeInTheDocument();
    expect(screen.getByText("Jumping Jacks")).toBeInTheDocument();
  });

  it("displays sets, reps, and rest values for each exercise", () => {
    render(<RecommendationsPage />);
    // Each exercise should have labeled inputs for sets, reps, rest
    const setsInputs = screen.getAllByLabelText(/sets/i);
    const repsInputs = screen.getAllByLabelText(/reps/i);
    const restInputs = screen.getAllByLabelText(/rest/i);
    expect(setsInputs).toHaveLength(3);
    expect(repsInputs).toHaveLength(3);
    expect(restInputs).toHaveLength(3);
  });

  it("allows user to modify sets value", async () => {
    render(<RecommendationsPage />);
    const setsInputs = screen.getAllByLabelText(/sets/i);
    await userEvent.clear(setsInputs[0]);
    await userEvent.type(setsInputs[0], "5");
    expect(setsInputs[0]).toHaveValue(5);
  });

  it("navigates to home when Confirm is clicked", async () => {
    render(<RecommendationsPage />);
    await userEvent.click(screen.getByRole("button", { name: /confirm/i }));
    expect(mockPush).toHaveBeenCalledWith("/home");
  });
});
