"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

const setupTips = [
  {
    icon: "📏",
    title: "Height",
    description: "Place your device at waist to chest height for the best view of your full body.",
  },
  {
    icon: "📐",
    title: "Distance",
    description: "Stand about 2–3 metres away from the camera so your entire body is visible.",
  },
  {
    icon: "🔄",
    title: "Angle",
    description: "Keep the camera straight and level — avoid tilting up or down for accurate tracking.",
  },
];

export default function SetupPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <div className="text-center max-w-lg">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Set Up Your Space
        </h1>
        <p className="text-muted">
          Position your device so the camera can see your full body during
          workouts.
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {setupTips.map((tip) => (
          <Card key={tip.title} className="flex items-start gap-4">
            <span className="text-3xl">{tip.icon}</span>
            <div>
              <h3 className="font-semibold text-lg">{tip.title}</h3>
              <p className="text-muted text-sm">{tip.description}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 w-full max-w-md">
        <Button variant="secondary" onClick={() => router.back()} className="flex-1">
          Back
        </Button>
        <Button onClick={() => router.push("/onboarding/quiz")} className="flex-1">
          Next
        </Button>
      </div>
    </div>
  );
}
