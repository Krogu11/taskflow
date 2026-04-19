import Link from "next/link";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "Serverfehler – bitte versuche es später erneut.",
  AccessDenied: "Zugriff verweigert.",
  Verification: "Der Link ist abgelaufen oder wurde bereits verwendet.",
  Default: "Ein Fehler ist aufgetreten.",
};

export default async function AuthErrorPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const message = ERROR_MESSAGES[error ?? "Default"] ?? ERROR_MESSAGES.Default;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm border border-gray-200 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Fehler</h1>
        <p className="mb-6 text-sm text-gray-500">{message}</p>
        <Link
          href="/auth/signin"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Zurück zur Anmeldung
        </Link>
      </div>
    </main>
  );
}
