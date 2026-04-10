import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import NotFoundPage from "../not-found";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("Navigation & Routing", () => {
  describe("404 Page", () => {

    it("renders a not found message", () => {
      render(<NotFoundPage />);
      expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    });

    it("renders a link to go home", () => {
      render(<NotFoundPage />);
      expect(screen.getByRole("link", { name: /go home/i })).toBeInTheDocument();
    });
  });
});
