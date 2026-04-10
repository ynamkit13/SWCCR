type CoachingInput = {
  exercise: string;
  setNumber: number;
  repsCompleted: number;
  formIssues: string[];
};

type SummaryInput = {
  exercises: {
    name: string;
    sets: number;
    repsPerSet: number[];
    formIssues: string[];
  }[];
};

export async function generateCoachingMessage(input: CoachingInput): Promise<string> {
  try {
    const response = await fetch("/api/coaching", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) throw new Error("API error");

    const data = await response.json();
    return data.message;
  } catch {
    return "Good work! Keep focusing on your form.";
  }
}

export async function generateWorkoutSummary(input: SummaryInput): Promise<string> {
  try {
    const response = await fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) throw new Error("API error");

    const data = await response.json();
    return data.summary;
  } catch {
    return "Workout complete! Great job pushing through your session.";
  }
}
