import LogoutButton from "@/components/LogoutButton";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

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
        <section className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium">Vos projets</h2>
            <a
              href="/projects/new"
              className="h-8 px-3 rounded-md bg-foreground text-background"
            >
              Nouveau
            </a>
          </div>
          {projects.length === 0 ? (
            <p className="text-black/70 dark:text-white/70">Aucun projet pour le moment.</p>
          ) : (
            <ul className="space-y-3">
              {projects.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between border border-black/10 dark:border-white/20 rounded-md p-3"
                >
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-black/60 dark:text-white/60">{p.provider}</div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`/projects/${p.id}/edit`}
                      className="h-8 px-3 rounded-md border border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      Modifier
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3">
            <a href="/projects" className="underline">Voir tous les projets</a>
          </div>
        </section>
      </main>
    </div>
  );
}
