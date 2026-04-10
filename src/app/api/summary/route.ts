import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { exercises } = await request.json();

    const workoutDescription = exercises
      .map(
        (e: { name: string; sets: number; repsPerSet: number[]; formIssues: string[] }) =>
          `${e.name}: ${e.sets} sets, reps per set: [${e.repsPerSet.join(", ")}]${
            e.formIssues.length > 0 ? `. Issues: ${e.formIssues.join(", ")}` : ""
          }`
      )
      .join("\n");

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `You are a supportive fitness coach summarizing a completed workout. Here's what the user did:

${workoutDescription}

Write a brief post-workout summary (3-4 sentences). Highlight what went well, mention any form issues to work on, and end with encouragement for next time.`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ summary: text });
  } catch (error) {
    console.error("Summary API error:", error);
    return NextResponse.json(
      { summary: "Workout complete! Great job pushing through your session." },
      { status: 500 }
    );
  }
}
