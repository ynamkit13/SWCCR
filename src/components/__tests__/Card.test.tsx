import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Card } from "../Card";

describe("Card", () => {
  it("renders children content", () => {
    render(<Card>Card content here</Card>);
    expect(screen.getByText("Card content here")).toBeInTheDocument();
  });

  it("applies rounded corners and shadow styling", () => {
    render(<Card>Styled card</Card>);
    const card = screen.getByText("Styled card").closest("div");
    expect(card).toHaveClass("rounded-2xl");
    expect(card).toHaveClass("shadow-sm");
  });

  it("renders with custom className", () => {
    render(<Card className="mt-4">Custom class</Card>);
    const card = screen.getByText("Custom class").closest("div");
    expect(card).toHaveClass("mt-4");
  });
});
