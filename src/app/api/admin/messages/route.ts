import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
export const dynamic = "force-dynamic";
const ADMIN_ROLES = ["super_admin", "admin", "manager", "staff"];
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.includes(session.role)) return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } }, { status: 403 });
    const list = await db.select({ id: messages.id, content: messages.content, isRead: messages.isRead, createdAt: messages.createdAt, senderName: users.name, senderEmail: users.email }).from(messages).leftJoin(users, eq(messages.senderId, users.id)).orderBy(desc(messages.createdAt)).limit(100);
    return NextResponse.json({ success: true, messages: list });
  } catch { return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal" } }, { status: 500 }); }
}
