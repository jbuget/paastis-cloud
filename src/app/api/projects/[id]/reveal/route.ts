import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { decryptWithMetadata, encryptToString } from "@/lib/crypto";

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
    const { plaintext } = decryptWithMetadata(project.apiKeyEnc);
    // Opportunistic re-encryption to current primary when revealed
    const reenc = encryptToString(plaintext);
    if (reenc !== project.apiKeyEnc) {
      await prisma.project.update({ where: { id: params.id }, data: { apiKeyEnc: reenc } });
    }
    return NextResponse.json({ apiKey: plaintext });
  } catch {
    return NextResponse.json({ error: "Cannot decrypt" }, { status: 500 });
  }
}
