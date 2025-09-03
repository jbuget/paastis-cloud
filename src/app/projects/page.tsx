import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DeleteProjectButton from "@/components/DeleteProjectButton";
import RevealApiKey from "@/components/RevealApiKey";

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="min-h-screen p-6">
        <p>Veuillez vous connecter.</p>
      </div>
    );
  }
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Projets</h1>
        <Link
          href="/projects/new"
          className="inline-flex items-center justify-center h-9 px-3 rounded-md bg-foreground text-background"
        >
          Nouveau projet
        </Link>
      </header>

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
              <div className="flex gap-2 items-center">
                <Link
                  href={`/projects/${p.id}/edit`
                  }
                  className="inline-flex items-center justify-center h-8 px-3 rounded-md border border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Modifier
                </Link>
                <Link
                  href={`/projects/${p.id}/apps`}
                  className="inline-flex items-center justify-center h-8 px-3 rounded-md border border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Apps
                </Link>
                <RevealApiKey id={p.id} />
                <DeleteProjectButton id={p.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
