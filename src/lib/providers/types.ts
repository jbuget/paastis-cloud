export type ProviderApp = {
  id: string;
  name: string;
  webUrl?: string;
  raw?: unknown;
};

export interface ProviderAdapter {
  listApps(apiKey: string): Promise<ProviderApp[]>;
}

