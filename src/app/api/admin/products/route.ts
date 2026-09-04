import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, auditLogs } from "@/db/schema";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import type { ProductOption } from "@/db/schema";

export const dynamic = "force-dynamic";
const createProductSchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(255).regex(/^[a-z0-9-]+$/),
  categoryId: z.string().uuid().optional(),
  shortDescription: z.string().max(500).optional(),
  description: z.string().max(5000).optional(),
  basePrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
  unit: z.string().max(50).optional(),
  minOrder: z.number().int().positive().optional(),
  productionDays: z.number().int().positive().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  specifications: z.record(z.string(), z.string()).optional(),
  thumbnail: z.string().url().optional().or(z.literal("")),
  gallery: z.array(z.string().url()).max(12).optional(),
  options: z.array(z.unknown()).max(30).optional(),
  fulfillmentType: z.enum(["physical", "digital", "hybrid"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, "products.create")) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Data tidak valid", details: parsed.error.issues } }, { status: 400 });
    }

    const [created] = await db.insert(products).values({
      name: parsed.data.name,
      slug: parsed.data.slug,
      categoryId: parsed.data.categoryId || null,
      shortDescription: parsed.data.shortDescription || null,
      description: parsed.data.description || null,
      basePrice: parsed.data.basePrice,
      unit: parsed.data.unit || "pcs",
      minOrder: parsed.data.minOrder || 1,
      productionDays: parsed.data.productionDays || 3,
      isFeatured: parsed.data.isFeatured ?? false,
      isActive: parsed.data.isActive ?? true,
      specifications: parsed.data.specifications || {},
      thumbnail: parsed.data.thumbnail || null,
      gallery: parsed.data.gallery || [],
      options: (parsed.data.options || []) as ProductOption[],
      fulfillmentType: parsed.data.fulfillmentType || "physical",
    }).returning();

    await db.insert(auditLogs).values({ userId: session.userId, action: "PRODUCT_CREATED", resource: "products", resourceId: created.id, metadata: { name: created.name, slug: created.slug } });

    return NextResponse.json({ success: true, product: created }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal membuat produk" } }, { status: 500 });
  }
}
