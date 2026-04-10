import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge } from "../Badge";

describe("Badge", () => {
  it("renders with label text", () => {
    render(<Badge>Intermediate</Badge>);
    expect(screen.getByText("Intermediate")).toBeInTheDocument();
  });

  it("applies default coral styling", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge).toHaveClass("bg-coral");
  });

  it("applies green variant", () => {
    render(<Badge variant="green">Completed</Badge>);
    const badge = screen.getByText("Completed");
    expect(badge).toHaveClass("bg-primary");
  });

  it("applies purple variant", () => {
    render(<Badge variant="purple">New</Badge>);
    const badge = screen.getByText("New");
    expect(badge).toHaveClass("bg-secondary");
  });
});
