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
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
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

/**
 * Get the knee angle (hip → knee → ankle) for the given side.
 * 180° = straight leg, lower = more bent.
 */
export function getKneeAngle(
  landmarks: Point[],
  side: "left" | "right"
): number {
  const hip = landmarks[side === "left" ? LANDMARKS.LEFT_HIP : LANDMARKS.RIGHT_HIP];
  const knee = landmarks[side === "left" ? LANDMARKS.LEFT_KNEE : LANDMARKS.RIGHT_KNEE];
  const ankle = landmarks[side === "left" ? LANDMARKS.LEFT_ANKLE : LANDMARKS.RIGHT_ANKLE];
  return calculateAngle(hip, knee, ankle);
}

/**
 * Get the torso lean angle.
 * Measures how much the midpoint of shoulders deviates from the midpoint of hips
 * along the vertical axis. Returns degrees from vertical — 0° = perfectly upright.
 */
export function getTorsoLeanAngle(landmarks: Point[]): number {
  const midShoulderX = (landmarks[LANDMARKS.LEFT_SHOULDER].x + landmarks[LANDMARKS.RIGHT_SHOULDER].x) / 2;
  const midShoulderY = (landmarks[LANDMARKS.LEFT_SHOULDER].y + landmarks[LANDMARKS.RIGHT_SHOULDER].y) / 2;
  const midHipX = (landmarks[LANDMARKS.LEFT_HIP].x + landmarks[LANDMARKS.RIGHT_HIP].x) / 2;
  const midHipY = (landmarks[LANDMARKS.LEFT_HIP].y + landmarks[LANDMARKS.RIGHT_HIP].y) / 2;

  const dx = midShoulderX - midHipX;
  const dy = midHipY - midShoulderY; // positive = shoulders above hips (normal)

  if (dy === 0) return 90;
  return Math.atan(Math.abs(dx) / dy) * (180 / Math.PI);
}
