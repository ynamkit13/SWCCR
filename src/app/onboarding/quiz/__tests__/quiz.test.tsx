import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import QuizPage from "../page";

const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

describe("Onboarding Quiz", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockBack.mockClear();
  });

  it("renders the first question about workout experience", () => {
    render(<QuizPage />);
    expect(screen.getByText(/how long have you been working out/i)).toBeInTheDocument();
  });

  it("renders all options for the first question", () => {
    render(<QuizPage />);
    expect(screen.getByText("Never")).toBeInTheDocument();
    expect(screen.getByText("Under 6 months")).toBeInTheDocument();
    expect(screen.getByText("1+ years")).toBeInTheDocument();
  });

  it("shows a progress indicator", () => {
    render(<QuizPage />);
    expect(screen.getByText(/step 1 of 3/i)).toBeInTheDocument();
  });

  it("has Next button disabled until an option is selected", () => {
    render(<QuizPage />);
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("enables Next button after selecting an option", async () => {
    render(<QuizPage />);
    await userEvent.click(screen.getByText("Never"));
    expect(screen.getByRole("button", { name: /next/i })).toBeEnabled();
  });

  it("advances to the second question when Next is clicked", async () => {
    render(<QuizPage />);
    await userEvent.click(screen.getByText("Never"));
    await userEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText(/how often do you exercise/i)).toBeInTheDocument();
    expect(screen.getByText(/step 2 of 3/i)).toBeInTheDocument();
  });

  it("goes back to the previous question when Back is clicked", async () => {
    render(<QuizPage />);
    await userEvent.click(screen.getByText("Never"));
    await userEvent.click(screen.getByRole("button", { name: /next/i }));
    await userEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(screen.getByText(/how long have you been working out/i)).toBeInTheDocument();
  });

  it("navigates to recommendations after completing all steps", async () => {
    render(<QuizPage />);
    // Step 1
    await userEvent.click(screen.getByText("Never"));
    await userEvent.click(screen.getByRole("button", { name: /next/i }));
    // Step 2
    await userEvent.click(screen.getByText("1–2"));
    await userEvent.click(screen.getByRole("button", { name: /next/i }));
    // Step 3
    await userEvent.click(screen.getByText("Build strength"));
    await userEvent.click(screen.getByRole("button", { name: /finish/i }));
    expect(mockPush).toHaveBeenCalledWith("/onboarding/recommendations");
  });
});
