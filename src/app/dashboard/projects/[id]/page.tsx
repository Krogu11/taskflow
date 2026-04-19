import { auth } from "@/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { NewTaskForm } from "@/components/tasks/new-task-form";
import { TaskItem } from "@/components/tasks/task-item";
import { TaskStatus } from "@prisma/client";

const STATUS_HEADINGS: Record<TaskStatus, string> = {
  TODO: "Offen",
  IN_PROGRESS: "In Bearbeitung",
  DONE: "Erledigt",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const project = await db.project.findFirst({
    where: { id, ownerId: session!.user!.id! },
    include: {
      tasks: { orderBy: [{ priority: "desc" }, { createdAt: "desc" }] },
    },
  });

  if (!project) notFound();

  const tasksByStatus = {
    TODO: project.tasks.filter((t) => t.status === "TODO"),
    IN_PROGRESS: project.tasks.filter((t) => t.status === "IN_PROGRESS"),
    DONE: project.tasks.filter((t) => t.status === "DONE"),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/projects"
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            ← Projekte
          </Link>
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          </div>
        </div>
        <NewTaskForm projectId={project.id} />
      </div>

      {project.description && (
        <p className="text-sm text-gray-500">{project.description}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {(["TODO", "IN_PROGRESS", "DONE"] as TaskStatus[]).map((status) => (
          <div key={status} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                {STATUS_HEADINGS[status]}
              </h2>
              <span className="text-xs text-gray-400">
                {tasksByStatus[status].length}
              </span>
            </div>
            <div className="space-y-2">
              {tasksByStatus[status].length === 0 ? (
                <p className="py-4 text-center text-xs text-gray-300">Keine Aufgaben</p>
              ) : (
                tasksByStatus[status].map((task) => (
                  <TaskItem
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description}
                    status={task.status}
                    priority={task.priority}
                    dueDate={task.dueDate?.toISOString() ?? null}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
