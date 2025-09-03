"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Échec de l'inscription");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-black/10 dark:border-white/20 rounded-lg p-6 bg-background">
        <h1 className="text-2xl font-semibold mb-4">Inscription</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-black/10 dark:border-white/20 bg-transparent px-3 py-2"
              required
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-black/10 dark:border-white/20 bg-transparent px-3 py-2"
              required
              minLength={6}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center w-full h-10 rounded-md bg-foreground text-background hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Création..." : "Créer le compte"}
          </button>
        </form>
        <p className="text-sm mt-4">
          Déjà un compte ? {" "}
          <a className="underline" href="/login">
            Connectez-vous
          </a>
        </p>
      </div>
    </div>
  );
}
