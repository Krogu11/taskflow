import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  let dbStatus: "ok" | "error" = "ok";

  try {
    await db.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = "error";
    logger.error("health_check_db_failure", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  const durationMs = Date.now() - start;
  const status = dbStatus === "ok" ? 200 : 503;

  const body = {
    status: dbStatus === "ok" ? "ok" : "degraded",
    db: dbStatus,
    uptime: process.uptime(),
    durationMs,
    timestamp: new Date().toISOString(),
  };

  logger.info("health_check", { status, durationMs, db: dbStatus });

  return NextResponse.json(body, { status });
}
