import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles, auditLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { sanitizeArticleHtml } from "@/lib/security/sanitize-html";

export const dynamic = "force-dynamic";

const articleInputSchema = z.object({
  title: z.string().trim().min(2).max(255),
  slug: z.string().trim().min(2).max(255).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().trim().max(300).optional().default(""),
  content: z.string().max(250000).optional().default(""),
  category: z.string().trim().max(100).optional().default(""),
  thumbnail: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string().trim().min(1).max(60)).max(20).optional().default([]),
  seoTitle: z.string().trim().max(255).optional(),
  seoDescription: z.string().trim().max(160).optional(),
  seoKeywords: z.array(z.string().trim().min(1).max(80)).max(30).optional().default([]),
  focusKeyword: z.string().trim().max(120).optional(),
  canonicalUrl: z.string().url().max(1000).optional().or(z.literal("")),
  noIndex: z.boolean().optional().default(false),
  isPublished: z.boolean().optional().default(false),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, "content.read")) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } }, { status: 403 });
    }
    return NextResponse.json({ success: true, articles: await db.select().from(articles).orderBy(desc(articles.createdAt)) });
  } catch {
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal memuat artikel" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, "content.create")) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } }, { status: 403 });
    }
    const parsed = articleInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Data artikel tidak valid", details: parsed.error.issues } }, { status: 400 });
    }
    const data = parsed.data;
    const [created] = await db.insert(articles).values({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || null,
      content: sanitizeArticleHtml(data.content),
      category: data.category || null,
      thumbnail: data.thumbnail || null,
      tags: data.tags,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      seoKeywords: data.seoKeywords,
      focusKeyword: data.focusKeyword || null,
      canonicalUrl: data.canonicalUrl || null,
      noIndex: data.noIndex,
      authorId: session.userId,
      isPublished: data.isPublished,
      publishedAt: data.isPublished ? new Date() : null,
    }).returning();

    await db.insert(auditLogs).values({
      userId: session.userId,
      action: "ARTICLE_CREATED",
      resource: "articles",
      resourceId: created.id,
      metadata: { title: created.title, slug: created.slug },
    });

    return NextResponse.json({ success: true, article: created }, { status: 201 });
  } catch (error) {
    console.error("Article creation failed:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal membuat artikel" } }, { status: 500 });
  }
}
