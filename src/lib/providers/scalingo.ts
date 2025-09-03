import type { ProviderAdapter, ProviderApp } from "./types";
import { clientFromToken } from "scalingo";

async function listApps(apiKey: string): Promise<ProviderApp[]> {
  const client = await clientFromToken(apiKey, {});

  const user = await client.Users.self();
  console.log(user);

  const apps = await client.Apps.all();
  return apps.map((a) => {
    const id = a["id"];
    const name = a["name"];
    const url = a["url"];
    return { id, name, url, raw: a } as ProviderApp;
  });
}

export const scalingoAdapter: ProviderAdapter = {
  listApps,
};
