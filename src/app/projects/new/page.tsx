import ProjectForm from "@/components/ProjectForm";
import Link from "next/link";

export default function NewProjectPage() {
  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Nouveau projet</h1>
        <Link href="/projects" className="underline">Retour</Link>
      </header>
      <ProjectForm mode="create" />
    </div>
  );
}

