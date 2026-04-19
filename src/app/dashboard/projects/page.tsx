import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NewProjectForm } from "@/components/projects/new-project-form";
import { ProjectCard } from "@/components/projects/project-card";

export default async function ProjectsPage() {
  const session = await auth();

  const projects = await db.project.findMany({
    where: { ownerId: session!.user!.id! },
    include: { _count: { select: { tasks: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Projekte</h1>
        <NewProjectForm />
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-gray-500">Noch keine Projekte. Erstelle dein erstes Projekt!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              id={p.id}
              name={p.name}
              description={p.description}
              color={p.color}
              taskCount={p._count.tasks}
            />
          ))}
        </div>
      )}
    </div>
  );
}
