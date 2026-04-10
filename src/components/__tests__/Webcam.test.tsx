import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Webcam } from "../Webcam";

// Mock getUserMedia
const mockGetUserMedia = vi.fn();

beforeEach(() => {
  mockGetUserMedia.mockReset();
  Object.defineProperty(navigator, "mediaDevices", {
    value: { getUserMedia: mockGetUserMedia },
    writable: true,
    configurable: true,
  });
});

describe("Webcam", () => {
  it("renders a loading state initially", () => {
    mockGetUserMedia.mockReturnValue(new Promise(() => {})); // never resolves
    render(<Webcam />);
    expect(screen.getByText(/loading camera/i)).toBeInTheDocument();
  });

  it("renders error state when camera is unavailable", async () => {
    mockGetUserMedia.mockRejectedValue(new Error("NotAllowedError"));
    render(<Webcam />);
    expect(await screen.findByText(/camera access denied/i)).toBeInTheDocument();
  });

  it("renders a video element after camera loads", async () => {
    const mockStream = { getTracks: () => [{ stop: vi.fn() }] };
    mockGetUserMedia.mockResolvedValue(mockStream);
    render(<Webcam />);
    const video = await screen.findByTestId("webcam-video");
    expect(video).toBeInTheDocument();
    expect(video.tagName).toBe("VIDEO");
  });
});
