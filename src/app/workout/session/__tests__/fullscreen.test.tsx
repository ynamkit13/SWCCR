import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SessionLayout from "../layout";

describe("Session Layout", () => {
  it("renders children in a full-viewport container", () => {
    render(
      <SessionLayout>
        <div data-testid="child">content</div>
      </SessionLayout>
    );
    const container = screen.getByTestId("child").parentElement;
    expect(container).toHaveClass("w-screen");
    expect(container).not.toHaveClass("max-w-5xl");
  });
});
