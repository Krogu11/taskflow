import { describe, it, expect } from "vitest";
import { z } from "zod";
import { TaskStatus, TaskPriority } from "@prisma/client";

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().datetime().optional(),
});

describe("project validation", () => {
  it("accepts valid project data", () => {
    const result = createProjectSchema.safeParse({
      name: "Mein Projekt",
      description: "Beschreibung",
      color: "#6366f1",
    });
    expect(result.success).toBe(true);
  });

  it("requires a non-empty name", () => {
    const result = createProjectSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects names over 100 chars", () => {
    const result = createProjectSchema.safeParse({ name: "x".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("rejects invalid hex color", () => {
    const result = createProjectSchema.safeParse({ name: "Test", color: "red" });
    expect(result.success).toBe(false);
  });

  it("accepts project without optional fields", () => {
    const result = createProjectSchema.safeParse({ name: "Minimal" });
    expect(result.success).toBe(true);
  });
});

describe("task validation", () => {
  it("accepts valid task data", () => {
    const result = createTaskSchema.safeParse({
      title: "Aufgabe 1",
      priority: "HIGH",
      status: "TODO",
    });
    expect(result.success).toBe(true);
  });

  it("requires a non-empty title", () => {
    const result = createTaskSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = createTaskSchema.safeParse({ title: "Test", status: "INVALID" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid priority", () => {
    const result = createTaskSchema.safeParse({ title: "Test", priority: "CRITICAL" });
    expect(result.success).toBe(false);
  });

  it("rejects malformed dueDate", () => {
    const result = createTaskSchema.safeParse({ title: "Test", dueDate: "morgen" });
    expect(result.success).toBe(false);
  });

  it("accepts ISO datetime for dueDate", () => {
    const result = createTaskSchema.safeParse({
      title: "Test",
      dueDate: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
  });
});

describe("task status cycling", () => {
  const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

  it("cycles TODO → IN_PROGRESS → DONE → TODO", () => {
    expect(STATUS_ORDER[(STATUS_ORDER.indexOf("TODO") + 1) % STATUS_ORDER.length]).toBe("IN_PROGRESS");
    expect(STATUS_ORDER[(STATUS_ORDER.indexOf("IN_PROGRESS") + 1) % STATUS_ORDER.length]).toBe("DONE");
    expect(STATUS_ORDER[(STATUS_ORDER.indexOf("DONE") + 1) % STATUS_ORDER.length]).toBe("TODO");
  });
});
