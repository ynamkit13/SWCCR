import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import WelcomePage from "../page";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("Welcome Screen", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders the app name", () => {
    render(<WelcomePage />);
    expect(screen.getByText("AI Fitness Trainer")).toBeInTheDocument();
  });

  it("renders a tagline", () => {
    render(<WelcomePage />);
    expect(
      screen.getByText(/personal ai fitness coach/i)
    ).toBeInTheDocument();
  });

  it("renders a Get Started button", () => {
    render(<WelcomePage />);
    expect(
      screen.getByRole("button", { name: /get started/i })
    ).toBeInTheDocument();
  });

  it("navigates to setup guide when Get Started is clicked", async () => {
    const userEvent = (await import("@testing-library/user-event")).default;
    render(<WelcomePage />);
    await userEvent.click(screen.getByRole("button", { name: /get started/i }));
    expect(mockPush).toHaveBeenCalledWith("/onboarding/setup");
  });
});
