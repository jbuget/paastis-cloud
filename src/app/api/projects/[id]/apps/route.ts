import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listAppsForProject } from "@/lib/providers/service";
import { auditLog } from "@/lib/audit";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const apps = await listAppsForProject(params.id, user.id);
    // Best-effort audit with count only
    await auditLog({ userId: user.id, action: "provider.apps_list", entity: "project", entityId: params.id, meta: { count: apps.length } });
    return NextResponse.json({ apps });
  } catch (e) {
    const err = e as { status?: number; message?: string };
    const status = typeof err?.status === "number" ? err.status : 500;
    return NextResponse.json({ error: err?.message || "Failed to list apps" }, { status });
  }
}
