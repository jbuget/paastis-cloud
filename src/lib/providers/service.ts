import { prisma } from "@/lib/prisma";
import { decryptFromString } from "@/lib/crypto";
import { getProviderAdapter } from "./index";
import type { ProviderApp } from "./types";

export async function listAppsForProject(projectId: string, userId: string): Promise<ProviderApp[]> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { provider: true, apiKeyEnc: true },
  });
  if (!project) throw Object.assign(new Error("Project not found"), { status: 404 });
  const adapter = getProviderAdapter(project.provider);
  if (!adapter) throw Object.assign(new Error(`Unsupported provider: ${project.provider}`), { status: 400 });
  const apiKey = decryptFromString(project.apiKeyEnc);
  return adapter.listApps(apiKey);
}

