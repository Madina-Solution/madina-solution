import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
export const dynamic = "force-dynamic";
const ADMIN_ROLES = ["super_admin", "admin", "manager"];
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.includes(session.role)) return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } }, { status: 403 });
    const list = await db.select({ id: reviews.id, rating: reviews.rating, comment: reviews.comment, isApproved: reviews.isApproved, isVerified: reviews.isVerified, createdAt: reviews.createdAt, userName: users.name }).from(reviews).leftJoin(users, eq(reviews.userId, users.id)).orderBy(desc(reviews.createdAt));
    return NextResponse.json({ success: true, reviews: list });
  } catch { return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal" } }, { status: 500 }); }
}
