"use client";

import { useEffect, useRef } from "react";
import { Point } from "@/lib/angles";

// MediaPipe pose connections (pairs of landmark indices to draw lines between)
const POSE_CONNECTIONS: [number, number][] = [
  [11, 12], // shoulders
  [11, 13], [13, 15], // left arm
  [12, 14], [14, 16], // right arm
  [11, 23], [12, 24], // torso
  [23, 24], // hips
  [23, 25], [25, 27], // left leg
  [24, 26], [26, 28], // right leg
];

type SkeletonOverlayProps = {
  landmarks: Point[] | null;
  width: number;
  height: number;
  badJoints?: number[]; // indices of joints with form issues (drawn in red)
  mirrored?: boolean; // mirror x-coordinates to match selfie camera
  className?: string;
};

export function SkeletonOverlay({
  landmarks,
  width,
  height,
  badJoints = [],
  mirrored = false,
  className = "",
}: SkeletonOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    if (!landmarks || landmarks.length === 0) return;

    // Helper to convert landmark coordinates, with optional mirroring
    const toX = (x: number) => (mirrored ? (1 - x) * width : x * width);
    const toY = (y: number) => y * height;

    // Draw connections (bones)
    ctx.strokeStyle = "#4CAF50";
    ctx.lineWidth = 3;
    for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      if (!start || !end) continue;

      const isBad = badJoints.includes(startIdx) || badJoints.includes(endIdx);
      ctx.strokeStyle = isBad ? "#ef4444" : "#4CAF50";

      ctx.beginPath();
      ctx.moveTo(toX(start.x), toY(start.y));
      ctx.lineTo(toX(end.x), toY(end.y));
      ctx.stroke();
    }

    // Draw landmarks (joints)
    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i];
      // Only draw body landmarks (skip face landmarks 0-10)
      if (i < 11) continue;

      const isBad = badJoints.includes(i);
      ctx.fillStyle = isBad ? "#ef4444" : "#4CAF50";

      ctx.beginPath();
      ctx.arc(toX(lm.x), toY(lm.y), 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [landmarks, width, height, badJoints, mirrored]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="skeleton-canvas"
      width={width}
      height={height}
      className={`pointer-events-none ${className}`}
    />
  );
}
