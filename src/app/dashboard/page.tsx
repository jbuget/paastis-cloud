import LogoutButton from "@/components/LogoutButton";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <a
            href="/projects"
            className="h-9 px-3 rounded-md border border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10"
          >
            Projets
          </a>
          <LogoutButton />
        </div>
      </header>
      <main className="space-y-4">
        <p>Bienvenue, {user.email} 👋</p>
        <p className="text-sm text-black/70 dark:text-white/70">
          Ceci est une page protégée. Vous êtes connecté grâce à un cookie de
          session signé côté serveur.
        </p>
      </main>
    </div>
  );
}
