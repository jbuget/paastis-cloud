import ProjectForm from "@/components/ProjectForm";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditProjectPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const user = await getCurrentUser();
  if (!user) notFound();
  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
  });
  if (!project) notFound();

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Modifier le projet</h1>
        <Link href="/projects" className="underline">Retour</Link>
      </header>
      <ProjectForm
        mode="edit"
        projectId={project.id}
        initial={{ name: project.name, provider: project.provider }}
      />
    </div>
  );
}
