import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SkeletonOverlay } from "../SkeletonOverlay";

const mockCtx = {
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  closePath: vi.fn(),
  fillStyle: "",
  strokeStyle: "",
  lineWidth: 0,
};

HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockCtx) as any;

const mockLandmarks = Array.from({ length: 33 }, (_, i) => ({
  x: i / 33,
  y: i / 33,
  z: 0,
}));

describe("SkeletonOverlay", () => {
  it("renders a canvas element", () => {
    render(<SkeletonOverlay landmarks={null} width={640} height={480} />);
    expect(screen.getByTestId("skeleton-canvas")).toBeInTheDocument();
  });

  it("calls drawing functions when landmarks are provided", () => {
    render(<SkeletonOverlay landmarks={mockLandmarks} width={640} height={480} />);
    expect(mockCtx.arc).toHaveBeenCalled();
    expect(mockCtx.moveTo).toHaveBeenCalled();
  });

  it("canvas uses provided width and height attributes", () => {
    render(<SkeletonOverlay landmarks={null} width={800} height={600} />);
    const canvas = screen.getByTestId("skeleton-canvas") as HTMLCanvasElement;
    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(600);
  });

  it("mirrors x-coordinates for selfie mode", () => {
    mockCtx.arc.mockClear();
    // Landmark at x=0.2 on a 640px canvas should draw at (1-0.2)*640 = 512
    const singleLandmark = Array.from({ length: 33 }, () => ({ x: 0.2, y: 0.5, z: 0 }));
    render(<SkeletonOverlay landmarks={singleLandmark} width={640} height={480} mirrored />);
    // Check that arc was called with mirrored x
    const arcCalls = mockCtx.arc.mock.calls;
    const firstBodyLandmarkCall = arcCalls.find((call: number[]) => Math.abs(call[0] - 512) < 1);
    expect(firstBodyLandmarkCall).toBeDefined();
  });
});
