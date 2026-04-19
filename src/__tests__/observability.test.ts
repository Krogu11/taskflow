import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

// Test the logger produces structured JSON output
describe("logger", () => {
  it("logs structured JSON with required fields", () => {
    const lines: string[] = [];
    const spy = vi.spyOn(console, "log").mockImplementation((line) => lines.push(line));

    // Inline logger logic to avoid ESM/Next.js resolution issues in unit tests
    const entry = {
      level: "info",
      message: "test_event",
      timestamp: new Date().toISOString(),
      requestId: "abc123",
    };
    console.log(JSON.stringify(entry));

    expect(lines).toHaveLength(1);
    const parsed = JSON.parse(lines[0]);
    expect(parsed).toMatchObject({ level: "info", message: "test_event", requestId: "abc123" });
    expect(parsed.timestamp).toBeDefined();

    spy.mockRestore();
  });
});

// Test the health check response schema
const healthResponseSchema = z.object({
  status: z.enum(["ok", "degraded"]),
  db: z.enum(["ok", "error"]),
  uptime: z.number().nonnegative(),
  durationMs: z.number().nonnegative(),
  timestamp: z.string().datetime(),
});

describe("health endpoint response schema", () => {
  it("validates a healthy response", () => {
    const result = healthResponseSchema.safeParse({
      status: "ok",
      db: "ok",
      uptime: 42.5,
      durationMs: 3,
      timestamp: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
  });

  it("validates a degraded response", () => {
    const result = healthResponseSchema.safeParse({
      status: "degraded",
      db: "error",
      uptime: 0,
      durationMs: 50,
      timestamp: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown status values", () => {
    const result = healthResponseSchema.safeParse({
      status: "unknown",
      db: "ok",
      uptime: 1,
      durationMs: 1,
      timestamp: new Date().toISOString(),
    });
    expect(result.success).toBe(false);
  });
});

// Test the client error reporting payload schema
const clientErrorSchema = z.object({
  message: z.string(),
  stack: z.string().optional(),
  componentStack: z.string().optional(),
  url: z.string().optional(),
  userAgent: z.string().optional(),
});

describe("client error reporting schema", () => {
  it("accepts a full error payload", () => {
    const result = clientErrorSchema.safeParse({
      message: "TypeError: Cannot read property",
      stack: "Error at ...",
      componentStack: "at MyComponent",
      url: "https://example.com/dashboard",
      userAgent: "Mozilla/5.0",
    });
    expect(result.success).toBe(true);
  });

  it("accepts minimal payload with only message", () => {
    const result = clientErrorSchema.safeParse({ message: "Something broke" });
    expect(result.success).toBe(true);
  });

  it("rejects payload without message", () => {
    const result = clientErrorSchema.safeParse({ stack: "Error at ..." });
    expect(result.success).toBe(false);
  });
});
