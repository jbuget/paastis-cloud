"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PROVIDERS = [
  { value: "Scalingo", label: "Scalingo" },
  { value: "CleverCloud", label: "Clever Cloud" },
  { value: "Vercel", label: "Vercel" },
  { value: "Netlify", label: "Netlify" },
];

type ProjectInput = {
  name: string;
  provider: string;
  apiKey?: string; // optional on edit to keep unchanged
};

export default function ProjectForm({
  mode,
  initial,
  projectId,
}: {
  mode: "create" | "edit";
  initial?: ProjectInput;
  projectId?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProjectInput>(
    initial || { name: "", provider: PROVIDERS[0].value }
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const url = mode === "create" ? "/api/projects" : `/api/projects/${projectId}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur");
        return;
      }
      router.push("/projects");
      router.refresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm mb-1">Nom</label>
        <input
          id="name"
          type="text"
          required
          className="w-full rounded-md border border-black/10 dark:border-white/20 bg-transparent px-3 py-2"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="provider" className="block text-sm mb-1">Fournisseur</label>
        <select
          id="provider"
          className="w-full rounded-md border border-black/10 dark:border-white/20 bg-transparent px-3 py-2"
          value={form.provider}
          onChange={(e) => setForm({ ...form, provider: e.target.value })}
        >
          {PROVIDERS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="apiKey" className="block text-sm mb-1">Clé API</label>
        <input
          id="apiKey"
          type="password"
          placeholder={mode === "edit" ? "•••••••• (inchangée si vide)" : ""}
          className="w-full rounded-md border border-black/10 dark:border-white/20 bg-transparent px-3 py-2"
          onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
        />
        <p className="text-xs mt-1 text-black/60 dark:text-white/60">Chiffrée au repos, jamais renvoyée en clair.</p>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center h-10 rounded-md bg-foreground text-background px-4 disabled:opacity-60"
        >
          {loading ? "Enregistrement..." : mode === "create" ? "Créer" : "Enregistrer"}
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center h-10 rounded-md border border-black/10 dark:border-white/20 px-4"
          onClick={() => router.back()}
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
