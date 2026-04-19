"use client";

import { useRouter } from "next/navigation";
import { TaskStatus, TaskPriority } from "@prisma/client";

interface TaskItemProps {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "Offen",
  IN_PROGRESS: "In Bearbeitung",
  DONE: "Erledigt",
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  TODO: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-green-100 text-green-700",
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  LOW: "text-gray-400",
  MEDIUM: "text-yellow-500",
  HIGH: "text-red-500",
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Niedrig",
  MEDIUM: "Mittel",
  HIGH: "Hoch",
};

const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export function TaskItem({ id, title, description, status, priority, dueDate }: TaskItemProps) {
  const router = useRouter();

  async function cycleStatus() {
    const next = STATUS_ORDER[(STATUS_ORDER.indexOf(status) + 1) % STATUS_ORDER.length];
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Aufgabe "${title}" löschen?`)) return;
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== "DONE";

  return (
    <div className="group flex items-start gap-3 rounded-md border border-gray-100 bg-white p-4 hover:border-gray-200 hover:shadow-sm transition-all">
      <button
        onClick={cycleStatus}
        className={`mt-0.5 h-5 w-5 flex-shrink-0 rounded-full border-2 transition-colors ${
          status === "DONE"
            ? "border-green-500 bg-green-500"
            : status === "IN_PROGRESS"
            ? "border-blue-500 bg-blue-100"
            : "border-gray-300 hover:border-gray-400"
        }`}
        title={`Status: ${STATUS_LABELS[status]} — klicken zum Ändern`}
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-gray-900 ${status === "DONE" ? "line-through text-gray-400" : ""}`}>
          {title}
        </p>
        {description && (
          <p className="mt-0.5 text-xs text-gray-500 truncate">{description}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
            {STATUS_LABELS[status]}
          </span>
          <span className={`text-xs font-medium ${PRIORITY_COLORS[priority]}`}>
            {PRIORITY_LABELS[priority]}
          </span>
          {dueDate && (
            <span className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
              {isOverdue ? "Überfällig: " : "Fällig: "}
              {new Date(dueDate).toLocaleDateString("de-DE")}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={handleDelete}
        className="text-gray-300 hover:text-red-500 transition-colors text-xs opacity-0 group-hover:opacity-100"
        title="Löschen"
      >
        ✕
      </button>
    </div>
  );
}
