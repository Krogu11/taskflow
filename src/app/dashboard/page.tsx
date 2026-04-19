import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [projects, taskStats] = await Promise.all([
    db.project.findMany({
      where: { ownerId: userId },
      include: { _count: { select: { tasks: true } } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    db.task.groupBy({
      by: ["status"],
      where: { project: { ownerId: userId } },
      _count: true,
    }),
  ]);

  const stats = {
    todo: taskStats.find((s) => s.status === "TODO")?._count ?? 0,
    inProgress: taskStats.find((s) => s.status === "IN_PROGRESS")?._count ?? 0,
    done: taskStats.find((s) => s.status === "DONE")?._count ?? 0,
  };
  const total = stats.todo + stats.inProgress + stats.done;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Willkommen, {session?.user?.name ?? "Nutzer"}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">Hier ist dein Überblick.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Projekte", value: projects.length, color: "text-indigo-600" },
          { label: "Offen", value: stats.todo, color: "text-gray-600" },
          { label: "In Bearbeitung", value: stats.inProgress, color: "text-blue-600" },
          { label: "Erledigt", value: stats.done, color: "text-green-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="mb-2 text-sm font-medium text-gray-700">Fortschritt</p>
          <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${Math.round((stats.done / total) * 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">
            {Math.round((stats.done / total) * 100)} % abgeschlossen
          </p>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Letzte Projekte</h2>
          <Link href="/dashboard/projects" className="text-sm text-indigo-600 hover:underline">
            Alle anzeigen →
          </Link>
        </div>
        {projects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-500">Noch keine Projekte.</p>
            <Link
              href="/dashboard/projects"
              className="mt-2 inline-block text-sm text-indigo-600 hover:underline"
            >
              Erstes Projekt erstellen →
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/projects/${p.id}`}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
              >
                <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400">{p._count.tasks} Aufgaben</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
