import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { z } from "zod";
export const dynamic = "force-dynamic";
const updateArticleSchema = z.object({ title: z.string().min(2).optional(), slug: z.string().regex(/^[a-z0-9-]+$/).optional(), excerpt: z.string().optional(), content: z.string().optional(), category: z.string().optional(), thumbnail: z.string().url().optional().or(z.literal("")), tags: z.array(z.string()).optional(), isPublished: z.boolean().optional() });
type Ctx = { params: Promise<{ id: string }> };
export async function PATCH(request: NextRequest, context: Ctx) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, "content.update")) return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } }, { status: 403 });
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateArticleSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Data tidak valid", details: parsed.error.issues } }, { status: 400 });
    const updateData = { ...parsed.data, ...(parsed.data.isPublished === true ? { publishedAt: new Date() } : parsed.data.isPublished === false ? { publishedAt: null } : {}), updatedAt: new Date() };
    const [updated] = await db.update(articles).set(updateData).where(eq(articles.id, id)).returning();
    if (!updated) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Tidak ditemukan" } }, { status: 404 });
    await db.insert(auditLogs).values({ userId: session.userId, action: "ARTICLE_UPDATED", resource: "articles", resourceId: id, metadata: body });
    return NextResponse.json({ success: true, article: updated });
  } catch { return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal" } }, { status: 500 }); }
}
export async function DELETE(request: NextRequest, context: Ctx) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, "content.delete")) return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } }, { status: 403 });
    const { id } = await context.params;
    await db.delete(articles).where(eq(articles.id, id));
    await db.insert(auditLogs).values({ userId: session.userId, action: "ARTICLE_DELETED", resource: "articles", resourceId: id });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal" } }, { status: 500 }); }
}
