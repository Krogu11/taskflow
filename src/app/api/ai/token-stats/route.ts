import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const usages = await db.tokenUsage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const totals = usages.reduce(
    (acc, u) => ({
      inputTokens: acc.inputTokens + u.inputTokens,
      outputTokens: acc.outputTokens + u.outputTokens,
      cacheCreationInputTokens: acc.cacheCreationInputTokens + u.cacheCreationInputTokens,
      cacheReadInputTokens: acc.cacheReadInputTokens + u.cacheReadInputTokens,
      requests: acc.requests + 1,
    }),
    { inputTokens: 0, outputTokens: 0, cacheCreationInputTokens: 0, cacheReadInputTokens: 0, requests: 0 },
  );

  const totalPromptTokens =
    totals.inputTokens + totals.cacheCreationInputTokens + totals.cacheReadInputTokens;

  const cacheHitRate =
    totalPromptTokens > 0
      ? Math.round((totals.cacheReadInputTokens / totalPromptTokens) * 100)
      : 0;

  return NextResponse.json({
    totals,
    cacheHitRate,
    recentUsages: usages.slice(0, 10).map((u) => ({
      id: u.id,
      endpoint: u.endpoint,
      model: u.model,
      inputTokens: u.inputTokens,
      outputTokens: u.outputTokens,
      cacheCreationInputTokens: u.cacheCreationInputTokens,
      cacheReadInputTokens: u.cacheReadInputTokens,
      createdAt: u.createdAt,
    })),
  });
}
