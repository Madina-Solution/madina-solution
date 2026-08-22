import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { media, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, context: Ctx) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, "media.delete")) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } }, { status: 403 });
    }

    const { id } = await context.params;

    // Soft delete
    const [deleted] = await db.update(media).set({ deletedAt: new Date() }).where(eq(media.id, id)).returning({ id: media.id, filename: media.originalFilename });
    if (!deleted) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "File tidak ditemukan" } }, { status: 404 });

    await db.insert(auditLogs).values({
      userId: session.userId, action: "MEDIA_DELETED", resource: "media", resourceId: id,
      metadata: { filename: deleted.filename },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal" } }, { status: 500 });
  }
}
