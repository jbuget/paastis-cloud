import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { listAppsForProject } from "@/lib/providers/service";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ProjectAppsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const user = await getCurrentUser();
  if (!user) notFound();
  const proj = await prisma.project.findFirst({ where: { id, userId: user.id } });
  if (!proj) notFound();

  let apps: { id: string; name: string; webUrl?: string }[] = [];
  let error: string | null = null;
  try {
    apps = await listAppsForProject(id, user.id);
  } catch (e) {
    const err = e as { message?: string };
    error = err?.message || "Impossible de récupérer la liste des applications.";
  }

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Applications — {proj.name}</h1>
        <Link href={`/projects`} className="underline">Retour</Link>
      </header>

      {error ? (
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
      ) : apps.length === 0 ? (
        <p className="text-black/70 dark:text-white/70">Aucune application trouvée.</p>
      ) : (
        <ul className="space-y-3">
          {apps.map((a) => (
            <li key={a.id} className="flex items-center justify-between border border-black/10 dark:border-white/20 rounded-md p-3">
              <div>
                <div className="font-medium">{a.name}</div>
                <div className="text-xs text-black/60 dark:text-white/60">{a.id}</div>
              </div>
              {a.webUrl && (
                <a
                  href={a.webUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="h-8 px-3 rounded-md border border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Ouvrir
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
