"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 text-center">
      <div className="flex flex-col gap-4">
        <h1 className="text-5xl font-bold tracking-tight">
          AI Fitness Trainer
        </h1>
        <p className="text-lg text-muted max-w-md mx-auto">
          Your personal AI fitness coach — real-time form tracking, rep
          counting, and voice feedback.
        </p>
      </div>

      <div className="flex flex-col gap-3 items-center max-w-sm w-full">
        <Button
          onClick={() => router.push("/onboarding/setup")}
          className="w-full text-lg py-4"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
