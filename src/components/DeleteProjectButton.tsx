"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteProjectButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const onDelete = async () => {
    if (!confirm("Supprimer ce projet ? Cette action est irréversible.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Suppression échouée");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  };
  return (
    <button
      onClick={onDelete}
      disabled={loading}
      className="h-8 px-3 rounded-md border border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-500/10 disabled:opacity-60"
    >
      {loading ? "Suppression..." : "Supprimer"}
    </button>
  );
}

