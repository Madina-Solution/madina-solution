import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
const ADMIN_ROLES = ["super_admin", "admin", "manager"];
type Ctx = { params: Promise<{ id: string }> };

const updateProductSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  slug: z.string().min(2).max(255).regex(/^[a-z0-9-]+$/).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  shortDescription: z.string().max(500).nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  basePrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  unit: z.string().max(50).optional(),
  minOrder: z.number().int().positive().optional(),
  productionDays: z.number().int().positive().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  specifications: z.record(z.string(), z.string()).optional(),
});

export async function GET(request: NextRequest, context: Ctx) {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.includes(session.role)) return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } }, { status: 403 });
    const { id } = await context.params;
    const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!product) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Produk tidak ditemukan" } }, { status: 404 });
    return NextResponse.json({ success: true, product });
  } catch { return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal" } }, { status: 500 }); }
}

export async function PATCH(request: NextRequest, context: Ctx) {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.includes(session.role)) return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } }, { status: 403 });
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Data tidak valid" } }, { status: 400 });
    const [updated] = await db.update(products).set({ ...parsed.data, updatedAt: new Date() }).where(eq(products.id, id)).returning();
    if (!updated) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Produk tidak ditemukan" } }, { status: 404 });
    await db.insert(auditLogs).values({ userId: session.userId, action: "PRODUCT_UPDATED", resource: "products", resourceId: id, metadata: parsed.data });
    return NextResponse.json({ success: true, product: updated });
  } catch { return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal" } }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, context: Ctx) {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.includes(session.role)) return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } }, { status: 403 });
    const { id } = await context.params;
    const [deactivated] = await db.update(products).set({ isActive: false, updatedAt: new Date() }).where(eq(products.id, id)).returning();
    if (!deactivated) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Produk tidak ditemukan" } }, { status: 404 });
    await db.insert(auditLogs).values({ userId: session.userId, action: "PRODUCT_DEACTIVATED", resource: "products", resourceId: id, metadata: { name: deactivated.name } });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal" } }, { status: 500 }); }
}
