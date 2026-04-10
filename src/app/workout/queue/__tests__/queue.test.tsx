import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import QueuePage from "../page";

const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

describe("Pre-Workout Queue Customisation", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockBack.mockClear();
  });

  it("renders all exercises in the queue", () => {
    render(<QueuePage />);
    expect(screen.getByText("Bicep Curls")).toBeInTheDocument();
    expect(screen.getByText("Lateral Raises")).toBeInTheDocument();
    expect(screen.getByText("Jumping Jacks")).toBeInTheDocument();
  });

  it("allows adjusting sets value", async () => {
    render(<QueuePage />);
    const setsInputs = screen.getAllByLabelText(/sets/i);
    await userEvent.clear(setsInputs[0]);
    await userEvent.type(setsInputs[0], "5");
    expect(setsInputs[0]).toHaveValue(5);
  });

  it("allows adjusting reps value", async () => {
    render(<QueuePage />);
    const repsInputs = screen.getAllByLabelText(/reps/i);
    await userEvent.clear(repsInputs[0]);
    await userEvent.type(repsInputs[0], "15");
    expect(repsInputs[0]).toHaveValue(15);
  });

  it("allows removing an exercise", async () => {
    render(<QueuePage />);
    const removeButtons = screen.getAllByRole("button", { name: /remove/i });
    await userEvent.click(removeButtons[0]);
    expect(screen.queryByText("Bicep Curls")).not.toBeInTheDocument();
  });

  it("renders drag handles for reordering", () => {
    render(<QueuePage />);
    const dragHandles = screen.getAllByLabelText(/drag to reorder/i);
    expect(dragHandles).toHaveLength(3);
  });

  it("renders a Start Workout button", () => {
    render(<QueuePage />);
    expect(screen.getByRole("button", { name: /start workout/i })).toBeInTheDocument();
  });

  it("navigates back when Back is clicked", async () => {
    render(<QueuePage />);
    await userEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(mockBack).toHaveBeenCalledOnce();
  });

  it("saves customised queue to localStorage on Start Workout", async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    render(<QueuePage />);
    await userEvent.click(screen.getByRole("button", { name: /start workout/i }));
    expect(setItemSpy).toHaveBeenCalledWith(
      "recommended_exercises",
      expect.any(String)
    );
    setItemSpy.mockRestore();
  });
});
