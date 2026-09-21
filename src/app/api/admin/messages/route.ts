import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { messages, users, orders, payments } from "@/db/schema";
import { and, asc, desc, eq, or } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

// GET /api/admin/messages                  -> list conversations, one row per customer
// GET /api/admin/messages?customerId=<id>   -> full thread with that customer
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, "messages.read")) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } }, { status: 403 });
    }

    const customerId = request.nextUrl.searchParams.get("customerId");

    if (customerId) {
      const thread = await db
        .select({
          id: messages.id,
          content: messages.content,
          senderId: messages.senderId,
          isRead: messages.isRead,
          createdAt: messages.createdAt,
          orderId: messages.orderId,
          orderNumber: orders.orderNumber,
        })
        .from(messages)
        .leftJoin(orders, eq(messages.orderId, orders.id))
        .where(or(eq(messages.senderId, customerId), eq(messages.receiverId, customerId)))
        .orderBy(asc(messages.createdAt));

      // Mark messages sent TO admin (from this customer) as read now that the thread is opened.
      const unreadIncoming = thread.filter((m) => m.senderId === customerId && !m.isRead);
      if (unreadIncoming.length > 0) {
        await Promise.all(unreadIncoming.map((m) => db.update(messages).set({ isRead: true }).where(eq(messages.id, m.id))));
      }

      const [customer] = await db.select({ id: users.id, name: users.name, email: users.email, phone: users.phone, avatar: users.avatar, role: users.role, createdAt: users.createdAt }).from(users).where(eq(users.id, customerId)).limit(1);
      const customerOrders = await db.select({ id: orders.id, orderNumber: orders.orderNumber, total: orders.total, paymentStatus: orders.paymentStatus, status: orders.status, createdAt: orders.createdAt }).from(orders).where(eq(orders.userId, customerId)).orderBy(desc(orders.createdAt)).limit(8);
      const allCustomerOrders = await db.select({ id: orders.id, total: orders.total }).from(orders).where(eq(orders.userId, customerId));
      const paidByOrder = await db.select({ orderId: payments.orderId, amount: payments.amount }).from(payments).innerJoin(orders, eq(payments.orderId, orders.id)).where(and(eq(orders.userId, customerId), eq(payments.status, "paid")));
      const paidTotal = paidByOrder.reduce((sum, row) => sum + Number(row.amount || 0), 0);
      const outstanding = allCustomerOrders.reduce((sum, row) => sum + Math.max(0, Number(row.total || 0) - paidByOrder.filter((p) => p.orderId === row.id).reduce((s, p) => s + Number(p.amount || 0), 0)), 0);
      return NextResponse.json({ success: true, customer: customer || null, customerOrders, financialSummary: { paidTotal, outstanding }, messages: thread.map((m) => ({ ...m, isMine: m.senderId !== customerId })) });
    }

    // Conversation list: every message joined to the sender's role, then grouped in
    // JS by "the customer party" (whichever side has role=customer). Kept in JS
    // rather than a complex SQL aggregation for reliability at this data volume.
    const all = await db
      .select({
        id: messages.id,
        content: messages.content,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        senderRole: users.role,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .orderBy(desc(messages.createdAt));

    const customerIds = new Set<string>();
    for (const m of all) {
      const customerSide = m.senderRole === "customer" ? m.senderId : m.receiverId;
      customerIds.add(customerSide);
    }

    const conversations = await Promise.all(
      Array.from(customerIds).map(async (custId) => {
        const [customer] = await db.select({ id: users.id, name: users.name, email: users.email, avatar: users.avatar, role: users.role }).from(users).where(eq(users.id, custId)).limit(1);
        const threadMessages = all.filter((m) => m.senderId === custId || m.receiverId === custId);
        const last = threadMessages[0]; // already ordered desc
        const unreadCount = threadMessages.filter((m) => m.senderId === custId && !m.isRead).length;
        return {
          customerId: custId,
          customerName: customer?.name || "Pengguna",
          customerEmail: customer?.email || "",
          customerRole: customer?.role || "customer",
          customerAvatar: customer?.avatar || null,
          lastMessage: last?.content || "",
          lastMessageAt: last?.createdAt ?? null,
          unreadCount,
        };
      })
    );

    conversations.sort((a, b) => new Date(b.lastMessageAt ?? 0).getTime() - new Date(a.lastMessageAt ?? 0).getTime());

    return NextResponse.json({ success: true, conversations });
  } catch {
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal memuat pesan" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, "messages.manage")) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } }, { status: 403 });
    }
    const customerId = request.nextUrl.searchParams.get("customerId");
    if (!customerId) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "customerId wajib diisi" } }, { status: 400 });
    }
    await db.delete(messages).where(or(eq(messages.senderId, customerId), eq(messages.receiverId, customerId)));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal menghapus percakapan" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, "messages.create")) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } }, { status: 403 });
    }
    const body = await request.json();
    const customerId = typeof body.customerId === "string" ? body.customerId : null;
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!customerId || !content || content.length > 2000) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Data tidak valid" } }, { status: 400 });
    }
    const orderId = typeof body.orderId === "string" ? body.orderId : null;
    if (orderId) {
      const [linkedOrder] = await db.select({ id: orders.id }).from(orders).where(and(eq(orders.id, orderId), eq(orders.userId, customerId))).limit(1);
      if (!linkedOrder) return NextResponse.json({ success: false, error: { code: "ORDER_INVALID", message: "Pesanan tidak terkait dengan pelanggan tersebut" } }, { status: 400 });
    }

    const [created] = await db
      .insert(messages)
      .values({ senderId: session.userId, receiverId: customerId, orderId, content })
      .returning();

    return NextResponse.json({ success: true, item: { ...created, isMine: true } }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal mengirim balasan" } }, { status: 500 });
  }
}
