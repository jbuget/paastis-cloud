import { prisma } from "@/lib/prisma";

export async function auditLog(params: {
  userId: string;
  action: string;
  entity?: string | null;
  entityId?: string | null;
  meta?: Record<string, unknown> | null;
}) {
  const { userId, action, entity = null, entityId = null, meta = null } = params;
  try {
    await prisma.auditLog.create({
      data: { userId, action, entity, entityId, meta },
    });
  } catch {
    // Swallow audit errors to not impact business flow
  }
}

