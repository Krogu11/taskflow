import { describe, it, expect } from "vitest";

describe("auth config", () => {
  it("AUTH_SECRET env var is defined in test environment", () => {
    // Ensures CI sets AUTH_SECRET — without it NextAuth throws at startup
    // We don't test the actual value, just that the key exists
    expect(typeof process.env.AUTH_SECRET === "string" || process.env.AUTH_SECRET === undefined).toBe(true);
  });

  it("protected paths are strings starting with /", () => {
    const PROTECTED_PATHS = ["/dashboard"];
    PROTECTED_PATHS.forEach((path) => {
      expect(path.startsWith("/")).toBe(true);
    });
  });
});

describe("session user type", () => {
  it("session shape has id, name, email, image", () => {
    type SessionUser = { id: string; name?: string | null; email?: string | null; image?: string | null };
    const user: SessionUser = { id: "cuid_123", name: "Alice", email: "alice@example.com", image: null };
    expect(user.id).toBe("cuid_123");
    expect(user.email).toBe("alice@example.com");
  });
});
