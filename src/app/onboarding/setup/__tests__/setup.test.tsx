import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SetupPage from "../page";

const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

describe("Device Setup Guide", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockBack.mockClear();
  });

  it("renders setup instructions about device placement", () => {
    render(<SetupPage />);
    expect(screen.getByRole("heading", { name: /height/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /distance/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /angle/i })).toBeInTheDocument();
  });

  it("renders a Next button", () => {
    render(<SetupPage />);
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
  });

  it("renders a Back button", () => {
    render(<SetupPage />);
    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
  });

  it("navigates to onboarding quiz when Next is clicked", async () => {
    render(<SetupPage />);
    await userEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(mockPush).toHaveBeenCalledWith("/onboarding/quiz");
  });

  it("navigates back when Back is clicked", async () => {
    render(<SetupPage />);
    await userEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(mockBack).toHaveBeenCalledOnce();
  });
});
