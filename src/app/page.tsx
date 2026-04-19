import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6">
      <div className="text-center">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600">
          <span className="text-2xl font-bold text-white">T</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">TaskFlow</h1>
        <p className="mt-3 text-lg text-gray-500">
          Projekte und Aufgaben einfach verwalten.
        </p>
        <Link
          href="/auth/signin"
          className="mt-8 inline-block rounded-lg bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          Jetzt starten
        </Link>
      </div>
    </main>
  );
}
