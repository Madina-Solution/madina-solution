import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orderItems, orders, reviews, users } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { auditLogs } from "@/db/schema";

export const dynamic = "force-dynamic";

const reviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional().default(""),
  images: z.array(z.string().url()).max(5).optional().default([]),
});

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "productId wajib diisi" } }, { status: 400 });
  }
  const list = await db.select({
    id: reviews.id,
    rating: reviews.rating,
    comment: reviews.comment,
    images: reviews.images,
    isVerified: reviews.isVerified,
    createdAt: reviews.createdAt,
    userName: users.name,
    userAvatar: users.avatar,
  })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(and(eq(reviews.productId, productId), eq(reviews.isApproved, true)))
    .orderBy(desc(reviews.createdAt))
    .limit(20);

  return NextResponse.json({ success: true, reviews: list });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Silakan login untuk menulis ulasan." } }, { status: 401 });
    }

    const parsed = reviewSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Rating 1–5 dan komentar maksimal 2.000 karakter." } }, { status: 400 });
    }
    const { productId, rating, comment, images } = parsed.data;

    // Eligibility is authoritative: the authenticated user must own a completed order
    // containing the target product.
    const [purchase] = await db.select({
      orderId: orders.id,
      orderItemId: orderItems.id,
    })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(
        eq(orderItems.productId, productId),
        eq(orders.userId, session.userId),
        eq(orders.status, "completed"),
      ))
      .orderBy(desc(orders.completedAt), desc(orders.createdAt))
      .limit(1);

    if (!purchase) {
      return NextResponse.json({ success: false, error: { code: "NOT_ELIGIBLE", message: "Ulasan hanya dapat dikirim setelah produk pernah dibeli melalui akun ini dan pesanan berstatus selesai." } }, { status: 403 });
    }

    const [existing] = await db.select({ id: reviews.id })
      .from(reviews)
      .where(and(
        eq(reviews.userId, session.userId),
        eq(reviews.productId, productId),
        eq(reviews.orderId, purchase.orderId),
      ))
      .limit(1);

    if (existing) {
      return NextResponse.json({ success: false, error: { code: "ALREADY_REVIEWED", message: "Anda sudah memberikan ulasan untuk produk ini pada pesanan tersebut." } }, { status: 409 });
    }

    const [created] = await db.insert(reviews).values({
      userId: session.userId,
      productId,
      orderId: purchase.orderId,
      rating,
      comment: comment || null,
      images,
      isVerified: true,
      isApproved: false,
    }).returning();

    await db.insert(auditLogs).values({
      userId: session.userId,
      action: "REVIEW_SUBMITTED",
      resource: "reviews",
      resourceId: created.id,
      metadata: { productId, orderId: purchase.orderId, orderItemId: purchase.orderItemId, rating },
    });

    return NextResponse.json({
      success: true,
      review: created,
      message: "Ulasan berhasil dikirim dan menunggu moderasi admin.",
    }, { status: 201 });
  } catch (error) {
    console.error("Review submission failed:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal mengirim ulasan." } }, { status: 500 });
  }
}
