import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { anthropic, AI_MODEL, TASK_SUGGEST_SYSTEM_PROMPT, recordTokenUsage } from "@/lib/claude";

const suggestSchema = z.object({
  projectName: z.string().min(1).max(100),
  projectDescription: z.string().max(500).optional(),
  count: z.number().int().min(1).max(10).default(5),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const result = suggestSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const { projectName, projectDescription, count } = result.data;

  const userPrompt = `Project: ${projectName}${projectDescription ? `\nDescription: ${projectDescription}` : ""}

Generate ${count} task suggestions for this project.`;

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 2048,
    // Stable system prompt cached with ephemeral cache_control for 5-minute TTL
    system: [
      {
        type: "text",
        text: TASK_SUGGEST_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userPrompt }],
  });

  // Record token usage including cache metrics
  await recordTokenUsage({
    endpoint: "ai/suggest",
    model: AI_MODEL,
    usage: response.usage,
    userId: session.user.id,
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return NextResponse.json({ error: "No response from AI" }, { status: 502 });
  }

  let suggestions: unknown;
  try {
    suggestions = JSON.parse(textBlock.text);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 502 });
  }

  return NextResponse.json({
    suggestions,
    tokenUsage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      cacheCreationInputTokens: response.usage.cache_creation_input_tokens ?? 0,
      cacheReadInputTokens: response.usage.cache_read_input_tokens ?? 0,
    },
  });
}
