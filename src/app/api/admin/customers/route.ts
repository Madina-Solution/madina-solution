import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, orders } from "@/db/schema";
import { eq, desc, count, sum, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
export const dynamic = "force-dynamic";
const ADMIN_ROLES = ["super_admin", "admin", "manager", "staff"];

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.includes(session.role)) return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } }, { status: 403 });

    const customerList = await db.select({ id: users.id, name: users.name, email: users.email, phone: users.phone, role: users.role, isActive: users.isActive, createdAt: users.createdAt }).from(users).orderBy(desc(users.createdAt));

    const orderStats = await db.select({ userId: orders.userId, orderCount: count(), totalSpend: sum(orders.total) }).from(orders).groupBy(orders.userId);
    const statsMap = new Map(orderStats.map(s => [s.userId, { orderCount: Number(s.orderCount), totalSpend: Number(s.totalSpend ?? 0) }]));

    const customers = customerList.map(c => ({ ...c, orderCount: statsMap.get(c.id)?.orderCount || 0, totalSpend: statsMap.get(c.id)?.totalSpend || 0 }));

    return NextResponse.json({ success: true, customers });
  } catch { return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal" } }, { status: 500 }); }
}
