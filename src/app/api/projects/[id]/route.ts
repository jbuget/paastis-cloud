import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { encryptToString } from "@/lib/crypto";
import { auditLog } from "@/lib/audit";

const PROVIDERS = ["Scalingo", "CleverCloud", "Vercel", "Netlify"] as const;
type Provider = (typeof PROVIDERS)[number];

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const project = await prisma.project.findFirst({
    where: { id: params.id, userId: user.id },
    select: { id: true, name: true, provider: true, createdAt: true, updatedAt: true },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ project });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { name, provider, apiKey } = (await req.json()) as {
      name?: string;
      provider?: string;
      apiKey?: string;
    };
    if (!name || !provider) {
      return NextResponse.json(
        { error: "Nom et fournisseur requis." },
        { status: 400 }
      );
    }
    if (!PROVIDERS.includes(provider as Provider)) {
      return NextResponse.json(
        { error: "Fournisseur inconnu." },
        { status: 400 }
      );
    }
    const data: Partial<{ name: string; provider: Provider; apiKeyEnc: string }> = {
      name,
      provider: provider as Provider,
    };
    if (apiKey && apiKey.length > 0) {
      data.apiKeyEnc = encryptToString(apiKey);
    }
    const updated = await prisma.project.update({
      where: { id: params.id, userId: user.id },
      data,
      select: { id: true, name: true, provider: true, createdAt: true, updatedAt: true },
    });
    await auditLog({
      userId: user.id,
      action: "project.update",
      entity: "project",
      entityId: updated.id,
      meta: { name: updated.name, provider: updated.provider, apiKeyUpdated: Boolean(apiKey && apiKey.length > 0) },
    });
    return NextResponse.json({ project: updated });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await prisma.project.delete({ where: { id: params.id, userId: user.id } });
    await auditLog({
      userId: user.id,
      action: "project.delete",
      entity: "project",
      entityId: params.id,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
