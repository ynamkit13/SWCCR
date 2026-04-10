import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { exercise, setNumber, repsCompleted, formIssues } = await request.json();

    const formContext =
      formIssues.length > 0
        ? `Form issues detected: ${formIssues.join(", ")}.`
        : "No form issues detected — form was good.";

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: `You are a supportive fitness coach giving brief feedback between sets. The user just completed set ${setNumber} of ${exercise} with ${repsCompleted} reps. ${formContext}

Give a short (1-2 sentence) coaching note. Be specific about what they did well or what to improve. Keep it encouraging and actionable.`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ message: text });
  } catch (error) {
    console.error("Coaching API error:", error);
    return NextResponse.json(
      { message: "Good work! Keep focusing on your form." },
      { status: 500 }
    );
  }
}
