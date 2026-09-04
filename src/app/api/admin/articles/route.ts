import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles, auditLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, "content.read")) return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } }, { status: 403 });
    return NextResponse.json({ success: true, articles: await db.select().from(articles).orderBy(desc(articles.createdAt)) });
  } catch { return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal" } }, { status: 500 }); }
}
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, "content.create")) return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } }, { status: 403 });
    const body = await request.json();
    const parsed = z.object({ title: z.string().min(2), slug: z.string().min(2).regex(/^[a-z0-9-]+$/), excerpt: z.string().optional(), content: z.string().optional(), category: z.string().optional(), thumbnail: z.string().url().optional().or(z.literal("")), tags: z.array(z.string()).optional(), isPublished: z.boolean().optional() }).safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Data tidak valid" } }, { status: 400 });
    const [created] = await db.insert(articles).values({ ...parsed.data, authorId: session.userId, tags: parsed.data.tags || [], isPublished: parsed.data.isPublished ?? false, publishedAt: parsed.data.isPublished ? new Date() : null }).returning();
    await db.insert(auditLogs).values({ userId: session.userId, action: "ARTICLE_CREATED", resource: "articles", resourceId: created.id, metadata: { title: created.title } });
    return NextResponse.json({ success: true, article: created }, { status: 201 });
  } catch { return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal" } }, { status: 500 }); }
}
