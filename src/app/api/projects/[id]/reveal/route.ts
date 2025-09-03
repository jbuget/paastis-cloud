import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { decryptFromString } from "@/lib/crypto";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const project = await prisma.project.findFirst({
    where: { id: params.id, userId: user.id },
    select: { apiKeyEnc: true },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const apiKey = decryptFromString(project.apiKeyEnc);
    return NextResponse.json({ apiKey });
  } catch {
    return NextResponse.json({ error: "Cannot decrypt" }, { status: 500 });
  }
}

