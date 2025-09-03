"use client";
import { useState } from "react";

export default function RevealApiKey({ id }: { id: string }) {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKey = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${id}/reveal`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur");
        return null;
      }
      return data.apiKey as string;
    } catch {
      setError("Erreur réseau");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const onReveal = async () => {
    if (value) {
      setValue(null);
      return;
    }
    const v = await fetchKey();
    if (v) setValue(v);
  };

  const onCopy = async () => {
    const v = value ?? (await fetchKey());
    if (!v) return;
    await navigator.clipboard.writeText(v);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onReveal}
        disabled={loading}
        className="inline-flex items-center justify-center h-8 px-3 rounded-md border border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-60"
      >
        {value ? "Masquer" : loading ? "Chargement..." : "Révéler"}
      </button>
      <button
        onClick={onCopy}
        disabled={loading}
        className="inline-flex items-center justify-center h-8 px-3 rounded-md border border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-60"
      >
        Copier
      </button>
      {value && (
        <code className="text-xs p-1 rounded bg-black/5 dark:bg-white/10">{value}</code>
      )}
      {error && (
        <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
      )}
    </div>
  );
}
