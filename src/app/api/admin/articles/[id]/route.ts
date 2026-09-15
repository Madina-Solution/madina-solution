import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { sanitizeArticleHtml } from "@/lib/security/sanitize-html";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateArticleSchema = z.object({
  title: z.string().trim().min(2).max(255).optional(),
  slug: z.string().trim().min(2).max(255).regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.string().trim().max(300).optional(),
  content: z.string().max(250000).optional(),
  category: z.string().trim().max(100).optional(),
  thumbnail: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  seoTitle: z.string().trim().max(255).optional(),
  seoDescription: z.string().trim().max(160).optional(),
  seoKeywords: z.array(z.string().trim().min(1).max(80)).max(30).optional(),
  focusKeyword: z.string().trim().max(120).optional(),
  canonicalUrl: z.string().url().max(1000).optional().or(z.literal("")),
  noIndex: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Ctx) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, "content.update")) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } }, { status: 403 });
    }
    const { id } = await context.params;
    const parsed = updateArticleSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Data tidak valid", details: parsed.error.issues } }, { status: 400 });
    }

    const data = parsed.data;
    const updateData = {
      ...data,
      ...(data.content !== undefined ? { content: sanitizeArticleHtml(data.content) } : {}),
      ...(data.thumbnail === "" ? { thumbnail: null } : {}),
      ...(data.excerpt === "" ? { excerpt: null } : {}),
      ...(data.category === "" ? { category: null } : {}),
      ...(data.seoTitle === "" ? { seoTitle: null } : {}),
      ...(data.seoDescription === "" ? { seoDescription: null } : {}),
      ...(data.focusKeyword === "" ? { focusKeyword: null } : {}),
      ...(data.canonicalUrl === "" ? { canonicalUrl: null } : {}),
      ...(data.isPublished === true ? { publishedAt: new Date() } : data.isPublished === false ? { publishedAt: null } : {}),
      updatedAt: new Date(),
    };

    const [updated] = await db.update(articles).set(updateData).where(eq(articles.id, id)).returning();
    if (!updated) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Artikel tidak ditemukan" } }, { status: 404 });

    await db.insert(auditLogs).values({
      userId: session.userId,
      action: "ARTICLE_UPDATED",
      resource: "articles",
      resourceId: id,
      metadata: { title: updated.title, slug: updated.slug, isPublished: updated.isPublished },
    });

    return NextResponse.json({ success: true, article: updated });
  } catch (error) {
    console.error("Article update failed:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal memperbarui artikel" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: Ctx) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, "content.delete")) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } }, { status: 403 });
    }
    const { id } = await context.params;
    const [deleted] = await db.delete(articles).where(eq(articles.id, id)).returning({ id: articles.id });
    if (!deleted) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Artikel tidak ditemukan" } }, { status: 404 });

    await db.insert(auditLogs).values({ userId: session.userId, action: "ARTICLE_DELETED", resource: "articles", resourceId: id });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal menghapus artikel" } }, { status: 500 });
  }
}
