import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RestTimer } from "../RestTimer";

describe("RestTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders with initial rest duration", () => {
    render(<RestTimer duration={60} onComplete={() => {}} nextExercise="Lateral Raises" nextSet={2} />);
    expect(screen.getByText("60")).toBeInTheDocument();
  });

  it("counts down over time", () => {
    render(<RestTimer duration={60} onComplete={() => {}} nextExercise="Lateral Raises" nextSet={2} />);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText("55")).toBeInTheDocument();
  });

  it("shows ready prompt when timer reaches 0", () => {
    render(<RestTimer duration={3} onComplete={() => {}} nextExercise="Lateral Raises" nextSet={2} />);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText(/ready for your next set/i)).toBeInTheDocument();
  });

  it("adds 60 seconds when +1 min is clicked", async () => {
    vi.useRealTimers(); // need real timers for userEvent
    render(<RestTimer duration={30} onComplete={() => {}} nextExercise="Lateral Raises" nextSet={2} />);
    await userEvent.click(screen.getByRole("button", { name: /\+1 min/i }));
    expect(screen.getByText("90")).toBeInTheDocument();
  });

  it("calls onComplete when Start is clicked after timer ends", async () => {
    const handleComplete = vi.fn();
    render(<RestTimer duration={1} onComplete={handleComplete} nextExercise="Lateral Raises" nextSet={2} />);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    vi.useRealTimers();
    await userEvent.click(screen.getByRole("button", { name: /start/i }));
    expect(handleComplete).toHaveBeenCalledOnce();
  });
});
