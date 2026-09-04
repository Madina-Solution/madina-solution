import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
type Ctx = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";
export async function PATCH(request: NextRequest, context: Ctx) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, "customers.update")) return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } }, { status: 403 });
    const { id } = await context.params;
    const body = await request.json();
    // Only allow safe fields
    const allowed: Record<string, unknown> = {};
    if (typeof body.isActive === "boolean") allowed.isActive = body.isActive;
    if (Object.keys(allowed).length === 0) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Tidak ada perubahan" } }, { status: 400 });
    const [updated] = await db.update(users).set({ ...allowed, updatedAt: new Date() }).where(eq(users.id, id)).returning({ id: users.id, name: users.name, role: users.role, isActive: users.isActive });
    if (!updated) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "User tidak ditemukan" } }, { status: 404 });
    await db.insert(auditLogs).values({ userId: session.userId, action: "USER_UPDATED", resource: "users", resourceId: id, metadata: allowed });
    return NextResponse.json({ success: true, user: updated });
  } catch { return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal" } }, { status: 500 }); }
}
