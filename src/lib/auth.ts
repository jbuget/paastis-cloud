import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/session";

export async function getCurrentUser() {
  const session = await getSessionFromCookies();
  const email = session?.sub;
  if (!email) return null;
  return prisma.user.findUnique({ where: { email } });
}

