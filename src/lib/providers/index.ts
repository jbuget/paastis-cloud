import { scalingoAdapter } from "./scalingo";
import type { ProviderAdapter } from "./types";

export function getProviderAdapter(provider: string): ProviderAdapter | null {
  switch (provider) {
    case "Scalingo":
      return scalingoAdapter;
    // Future adapters:
    // case "CleverCloud": return cleverCloudAdapter;
    // case "Vercel": return vercelAdapter;
    // case "Netlify": return netlifyAdapter;
    default:
      return null;
  }
}

