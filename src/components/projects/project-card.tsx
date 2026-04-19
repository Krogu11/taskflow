"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProjectCardProps {
  id: string;
  name: string;
  description: string | null;
  color: string;
  taskCount: number;
}

export function ProjectCard({ id, name, description, color, taskCount }: ProjectCardProps) {
  const router = useRouter();

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm(`Projekt "${name}" wirklich löschen?`)) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <Link
      href={`/dashboard/projects/${id}`}
      className="group block rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
            {name}
          </h3>
        </div>
        <button
          onClick={handleDelete}
          className="text-gray-300 hover:text-red-500 transition-colors text-xs opacity-0 group-hover:opacity-100 ml-2"
          title="Löschen"
        >
          ✕
        </button>
      </div>
      {description && (
        <p className="mt-2 text-sm text-gray-500 line-clamp-2">{description}</p>
      )}
      <p className="mt-3 text-xs text-gray-400">
        {taskCount} {taskCount === 1 ? "Aufgabe" : "Aufgaben"}
      </p>
    </Link>
  );
}
