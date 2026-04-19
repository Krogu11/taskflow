import { NextRequest, NextResponse } from "next/server";
import { logger } from "./logger";

type Handler = (req: NextRequest, ctx?: unknown) => Promise<NextResponse>;

export function withLogging(handler: Handler): Handler {
  return async (req: NextRequest, ctx?: unknown) => {
    const start = Date.now();
    const { method, url } = req;
    const path = new URL(url).pathname;

    try {
      const res = await handler(req, ctx);
      logger.info("api_request", {
        method,
        path,
        status: res.status,
        durationMs: Date.now() - start,
      });
      return res;
    } catch (err) {
      logger.error("api_request_error", {
        method,
        path,
        durationMs: Date.now() - start,
        error: err instanceof Error ? err.message : String(err),
      });
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  };
}
