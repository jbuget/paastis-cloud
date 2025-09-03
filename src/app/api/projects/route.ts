import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { encryptToString } from "@/lib/crypto";
import { auditLog } from "@/lib/audit";

const PROVIDERS = ["Scalingo", "CleverCloud", "Vercel", "Netlify"] as const;
type Provider = (typeof PROVIDERS)[number];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { name, provider, apiKey } = (await req.json()) as {
      name?: string;
      provider?: string;
      apiKey?: string;
    };
    if (!name || !provider || !apiKey) {
      return NextResponse.json(
        { error: "Tous les champs sont requis." },
        { status: 400 }
      );
    }
    if (!PROVIDERS.includes(provider as Provider)) {
      return NextResponse.json(
        { error: "Fournisseur inconnu." },
        { status: 400 }
      );
    }
    const proj = await prisma.project.create({
      data: {
        name,
        provider: provider as Provider,
        apiKeyEnc: encryptToString(apiKey),
        userId: user.id,
      },
      select: { id: true, name: true, provider: true, createdAt: true, updatedAt: true },
    });
    await auditLog({
      userId: user.id,
      action: "project.create",
      entity: "project",
      entityId: proj.id,
      meta: { name, provider },
    });
    return NextResponse.json({ project: proj }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
}
