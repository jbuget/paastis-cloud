import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";
import { getSessionFromCookies } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";

export async function POST() {
  // Attempt to log the event with current user if available
  const session = await getSessionFromCookies();
  const email = session?.sub;
  if (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) await auditLog({ userId: user.id, action: "auth.logout", entity: "user", entityId: user.id });
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
