import Anthropic from "@anthropic-ai/sdk";
import { db } from "./db";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const AI_MODEL = "claude-sonnet-4-6";

// Stable system prompt — never inject dynamic content here to preserve cache hits
export const TASK_SUGGEST_SYSTEM_PROMPT = `You are an expert project management assistant for TaskFlow, a modern task management SaaS.

Your role is to generate actionable, well-scoped task suggestions for software projects.

When given a project name and description, produce a list of concrete tasks that would help the project succeed. Each task should:
- Have a clear, actionable title (max 80 chars)
- Include a brief description of what needs to be done (1-2 sentences)
- Have an appropriate priority: LOW, MEDIUM, or HIGH
- Be realistic and specific

Respond with valid JSON only — no markdown, no code fences, just the raw JSON array.

Format:
[
  {
    "title": "Task title",
    "description": "Brief description of the task",
    "priority": "HIGH" | "MEDIUM" | "LOW"
  }
]`;

export async function recordTokenUsage(params: {
  endpoint: string;
  model: string;
  usage: Anthropic.Usage;
  userId?: string;
}) {
  await db.tokenUsage.create({
    data: {
      endpoint: params.endpoint,
      model: params.model,
      inputTokens: params.usage.input_tokens,
      outputTokens: params.usage.output_tokens,
      cacheCreationInputTokens: params.usage.cache_creation_input_tokens ?? 0,
      cacheReadInputTokens: params.usage.cache_read_input_tokens ?? 0,
      userId: params.userId ?? null,
    },
  });
}
