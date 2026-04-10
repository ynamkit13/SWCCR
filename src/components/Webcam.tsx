"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

type WebcamProps = {
  className?: string;
};

export type WebcamHandle = {
  getVideo: () => HTMLVideoElement | null;
};

export const Webcam = forwardRef<WebcamHandle, WebcamProps>(
  function Webcam({ className = "" }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

    useImperativeHandle(ref, () => ({
      getVideo: () => videoRef.current,
    }));

    useEffect(() => {
      let cancelled = false;

      async function startCamera() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          });
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setStatus("ready");
        } catch {
          if (!cancelled) setStatus("error");
        }
      }

      startCamera();

      return () => {
        cancelled = true;
        streamRef.current?.getTracks().forEach((t) => t.stop());
      };
    }, []);

    if (status === "error") {
      return (
        <div className={`flex items-center justify-center bg-foreground/10 rounded-2xl ${className}`}>
          <p className="text-muted text-center px-4">
            Camera access denied. Please allow camera access in your browser settings.
          </p>
        </div>
      );
    }

    return (
      <div className={`relative overflow-hidden rounded-2xl bg-black ${className}`}>
        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/60">Loading camera...</p>
          </div>
        )}
        <video
          ref={videoRef}
          data-testid="webcam-video"
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />
      </div>
    );
  }
);
