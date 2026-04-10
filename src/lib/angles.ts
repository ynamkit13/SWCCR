export type Point = { x: number; y: number; z?: number };

// MediaPipe landmark indices
const LANDMARKS = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
} as const;

/**
 * Calculate the angle (in degrees) at point b, formed by vectors ba and bc.
 */
export function calculateAngle(a: Point, b: Point, c: Point): number {
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };

  const dot = ba.x * bc.x + ba.y * bc.y;
  const magBA = Math.sqrt(ba.x * ba.x + ba.y * ba.y);
  const magBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y);

  if (magBA === 0 || magBC === 0) return 0;

  const cosAngle = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return Math.acos(cosAngle) * (180 / Math.PI);
}

/**
 * Get the elbow angle (shoulder → elbow → wrist) for the given side.
 */
export function getElbowAngle(
  landmarks: Point[],
  side: "left" | "right"
): number {
  const shoulder = landmarks[side === "left" ? LANDMARKS.LEFT_SHOULDER : LANDMARKS.RIGHT_SHOULDER];
  const elbow = landmarks[side === "left" ? LANDMARKS.LEFT_ELBOW : LANDMARKS.RIGHT_ELBOW];
  const wrist = landmarks[side === "left" ? LANDMARKS.LEFT_WRIST : LANDMARKS.RIGHT_WRIST];
  return calculateAngle(shoulder, elbow, wrist);
}

/**
 * Get the shoulder abduction angle (hip → shoulder → elbow) for the given side.
 * 0° = arm at side, 90° = arm raised horizontally.
 */
export function getShoulderAbductionAngle(
  landmarks: Point[],
  side: "left" | "right"
): number {
  const hip = landmarks[side === "left" ? LANDMARKS.LEFT_HIP : LANDMARKS.RIGHT_HIP];
  const shoulder = landmarks[side === "left" ? LANDMARKS.LEFT_SHOULDER : LANDMARKS.RIGHT_SHOULDER];
  const elbow = landmarks[side === "left" ? LANDMARKS.LEFT_ELBOW : LANDMARKS.RIGHT_ELBOW];
  const angle = calculateAngle(hip, shoulder, elbow);
  return angle;
}
