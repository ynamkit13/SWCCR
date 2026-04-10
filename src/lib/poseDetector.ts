import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { Point } from "./angles";

export type PoseResult = {
  landmarks: Point[];
};

export type PoseDetector = {
  detect: (video: HTMLVideoElement, timestamp: number) => PoseResult | null;
  close: () => void;
};

export async function createPoseDetector(): Promise<PoseDetector> {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numPoses: 1, // Lock onto first person only
  });

  return {
    detect(video: HTMLVideoElement, timestamp: number): PoseResult | null {
      const result = poseLandmarker.detectForVideo(video, timestamp);

      if (!result.landmarks || result.landmarks.length === 0) {
        return null;
      }

      // Use first person only
      const landmarks: Point[] = result.landmarks[0].map((lm) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
      }));

      return { landmarks };
    },

    close() {
      poseLandmarker.close();
    },
  };
}
