"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";

const questions = [
  {
    question: "How long have you been working out?",
    options: ["Never", "Under 6 months", "1+ years"],
  },
  {
    question: "How often do you exercise per week?",
    options: ["1–2", "3–4", "5+"],
  },
  {
    question: "What's your goal?",
    options: ["Build strength", "Lose weight", "Stay active"],
  },
];

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(
    Array(questions.length).fill(null)
  );

  const current = questions[step];
  const isLastStep = step === questions.length - 1;
  const hasSelection = answers[step] !== null;

  function selectOption(option: string) {
    const next = [...answers];
    next[step] = option;
    setAnswers(next);
  }

  function handleNext() {
    if (isLastStep) {
      // Save quiz answers to localStorage for recommendations page
      if (typeof window !== "undefined") {
        localStorage.setItem("quiz_answers", JSON.stringify({
          experience: answers[0],
          frequency: answers[1],
          goal: answers[2],
        }));
      }
      router.push("/onboarding/recommendations");
    } else {
      setStep(step + 1);
    }
  }

  function handleBack() {
    setStep(step - 1);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <p className="text-sm text-muted font-medium">
        Step {step + 1} of {questions.length}
      </p>

      <h1 className="text-2xl font-bold tracking-tight text-center">
        {current.question}
      </h1>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        {current.options.map((option) => (
          <button
            key={option}
            onClick={() => selectOption(option)}
            className={`rounded-xl px-5 py-4 text-left text-base font-medium border-2 transition-colors cursor-pointer ${
              answers[step] === option
                ? "border-primary bg-primary/10 text-foreground"
                : "border-muted-light bg-surface text-foreground hover:border-muted"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex gap-3 w-full max-w-sm">
        {step > 0 && (
          <Button variant="secondary" onClick={handleBack} className="flex-1">
            Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!hasSelection}
          className="flex-1"
        >
          {isLastStep ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}
