import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        Willkommen, {session?.user?.name ?? "Nutzer"}!
      </h1>
      <p className="text-gray-500">Du bist erfolgreich angemeldet.</p>
    </div>
  );
}
