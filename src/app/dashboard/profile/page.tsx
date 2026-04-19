import { auth } from "@/auth";
import Image from "next/image";

export default async function ProfilePage() {
  const session = await auth();
  const user = session!.user!;

  return (
    <div className="max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Mein Profil</h1>

      <div className="rounded-2xl bg-white border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          {user.image && (
            <Image
              src={user.image}
              alt={user.name ?? "Avatar"}
              width={64}
              height={64}
              className="rounded-full"
            />
          )}
          <div>
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Name</dt>
            <dd className="font-medium text-gray-900">{user.name ?? "–"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">E-Mail</dt>
            <dd className="font-medium text-gray-900">{user.email ?? "–"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Nutzer-ID</dt>
            <dd className="font-mono text-xs text-gray-400">{user.id}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
