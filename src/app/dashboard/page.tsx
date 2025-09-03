import LogoutButton from "@/components/LogoutButton";
import { getSessionFromCookies } from "@/lib/session";

export default function DashboardPage() {
  const session = getSessionFromCookies();
  const email = session?.sub;

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <LogoutButton />
      </header>
      <main className="space-y-4">
        <p>Bienvenue{email ? `, ${email}` : ""} 👋</p>
        <p className="text-sm text-black/70 dark:text-white/70">
          Ceci est une page protégée. Vous êtes connecté grâce à un cookie de
          session signé côté serveur.
        </p>
      </main>
    </div>
  );
}

