import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { RepCounter } from "../HUD/RepCounter";
import { MuteButton } from "../HUD/MuteButton";
import { FormFeedback } from "../HUD/FormFeedback";

describe("RepCounter", () => {
  it("renders current rep and target", () => {
    render(<RepCounter current={3} target={10} />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText(/10/)).toBeInTheDocument();
  });

  it("shows remaining reps message", () => {
    render(<RepCounter current={7} target={10} />);
    expect(screen.getByText(/3 more to go/i)).toBeInTheDocument();
  });

  it("shows completion message when target reached", () => {
    render(<RepCounter current={10} target={10} />);
    expect(screen.getByText(/set complete/i)).toBeInTheDocument();
  });
});

describe("MuteButton", () => {
  it("renders unmuted state by default", () => {
    render(<MuteButton muted={false} onToggle={() => {}} />);
    expect(screen.getByRole("button", { name: /mute/i })).toBeInTheDocument();
  });

  it("renders muted state", () => {
    render(<MuteButton muted={true} onToggle={() => {}} />);
    expect(screen.getByRole("button", { name: /unmute/i })).toBeInTheDocument();
  });

  it("calls onToggle when clicked", async () => {
    const handleToggle = vi.fn();
    render(<MuteButton muted={false} onToggle={handleToggle} />);
    await userEvent.click(screen.getByRole("button"));
    expect(handleToggle).toHaveBeenCalledOnce();
  });
});

describe("FormFeedback", () => {
  it("renders feedback text when provided", () => {
    render(<FormFeedback message="Keep your elbows tucked" />);
    expect(screen.getByText("Keep your elbows tucked")).toBeInTheDocument();
  });

  it("renders nothing when no message", () => {
    const { container } = render(<FormFeedback message={null} />);
    expect(container.firstChild).toBeNull();
  });
});
