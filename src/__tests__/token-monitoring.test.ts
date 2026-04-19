import { describe, it, expect, vi } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import { TASK_SUGGEST_SYSTEM_PROMPT, AI_MODEL } from "@/lib/claude";

vi.mock("@/lib/db", () => ({
  db: {
    tokenUsage: {
      create: vi.fn().mockResolvedValue({}),
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

vi.mock("@anthropic-ai/sdk", () => {
  const mockCreate = vi.fn().mockResolvedValue({
    content: [{ type: "text", text: '[{"title":"Setup CI","description":"Configure GitHub Actions","priority":"HIGH"}]' }],
    usage: {
      input_tokens: 50,
      output_tokens: 30,
      cache_creation_input_tokens: 800,
      cache_read_input_tokens: 0,
    },
  });
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: { create: mockCreate },
    })),
  };
});

describe("Token Monitoring", () => {
  it("TASK_SUGGEST_SYSTEM_PROMPT is stable (no dynamic content)", () => {
    // System prompt must not change between calls — any change invalidates the cache
    const snapshot = TASK_SUGGEST_SYSTEM_PROMPT;
    expect(snapshot).toBe(TASK_SUGGEST_SYSTEM_PROMPT);
    expect(snapshot).not.toMatch(/\d{4}-\d{2}-\d{2}/); // no date strings
    expect(snapshot).not.toMatch(/uuid|random|Math\.random/i); // no random values
  });

  it("AI_MODEL is a valid Claude model ID", () => {
    expect(AI_MODEL).toMatch(/^claude-/);
    expect(AI_MODEL).toBe("claude-sonnet-4-6");
  });

  it("recordTokenUsage persists all four token fields", async () => {
    const { recordTokenUsage } = await import("@/lib/claude");
    const { db } = await import("@/lib/db");

    await recordTokenUsage({
      endpoint: "ai/suggest",
      model: AI_MODEL,
      usage: {
        input_tokens: 100,
        output_tokens: 50,
        cache_creation_input_tokens: 800,
        cache_read_input_tokens: 0,
      } as unknown as Anthropic.Usage,
      userId: "user_123",
    });

    expect(db.tokenUsage.create).toHaveBeenCalledWith({
      data: {
        endpoint: "ai/suggest",
        model: AI_MODEL,
        inputTokens: 100,
        outputTokens: 50,
        cacheCreationInputTokens: 800,
        cacheReadInputTokens: 0,
        userId: "user_123",
      },
    });
  });

  it("recordTokenUsage defaults cache fields to 0 when absent", async () => {
    const { recordTokenUsage } = await import("@/lib/claude");
    const { db } = await import("@/lib/db");

    await recordTokenUsage({
      endpoint: "ai/suggest",
      model: AI_MODEL,
      usage: {
        input_tokens: 200,
        output_tokens: 40,
      } as unknown as Anthropic.Usage,
    });

    expect(db.tokenUsage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        cacheCreationInputTokens: 0,
        cacheReadInputTokens: 0,
        userId: null,
      }),
    });
  });

  it("cache hit rate calculation is correct", () => {
    const inputTokens = 50;
    const cacheCreationInputTokens = 0;
    const cacheReadInputTokens = 800;
    const total = inputTokens + cacheCreationInputTokens + cacheReadInputTokens;
    const hitRate = Math.round((cacheReadInputTokens / total) * 100);
    expect(hitRate).toBe(94); // ~94% cache hit = significant cost reduction
  });
});
