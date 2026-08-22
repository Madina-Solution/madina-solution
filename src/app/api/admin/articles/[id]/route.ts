import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
export const dynamic = "force-dynamic";
const ADMIN_ROLES = ["super_admin", "admin", "manager"];
type Ctx = { params: Promise<{ id: string }> };
export async function PATCH(request: NextRequest, context: Ctx) {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.includes(session.role)) return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } }, { status: 403 });
    const { id } = await context.params;
    const body = await request.json();
    if (body.isPublished === true) body.publishedAt = new Date();
    const [updated] = await db.update(articles).set({ ...body, updatedAt: new Date() }).where(eq(articles.id, id)).returning();
    if (!updated) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Tidak ditemukan" } }, { status: 404 });
    await db.insert(auditLogs).values({ userId: session.userId, action: "ARTICLE_UPDATED", resource: "articles", resourceId: id, metadata: body });
    return NextResponse.json({ success: true, article: updated });
  } catch { return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal" } }, { status: 500 }); }
}
export async function DELETE(request: NextRequest, context: Ctx) {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.includes(session.role)) return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } }, { status: 403 });
    const { id } = await context.params;
    await db.delete(articles).where(eq(articles.id, id));
    await db.insert(auditLogs).values({ userId: session.userId, action: "ARTICLE_DELETED", resource: "articles", resourceId: id });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal" } }, { status: 500 }); }
}
