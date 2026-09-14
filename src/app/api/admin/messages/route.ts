import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { messages, users, orders } from "@/db/schema";
import { asc, desc, eq, or } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

// GET /api/admin/messages                  -> list conversations, one row per customer
// GET /api/admin/messages?customerId=<id>   -> full thread with that customer
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, "content.read")) {
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

      return NextResponse.json({ success: true, messages: thread.map((m) => ({ ...m, isMine: m.senderId !== customerId })) });
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
        const [customer] = await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.id, custId)).limit(1);
        const threadMessages = all.filter((m) => m.senderId === custId || m.receiverId === custId);
        const last = threadMessages[0]; // already ordered desc
        const unreadCount = threadMessages.filter((m) => m.senderId === custId && !m.isRead).length;
        return {
          customerId: custId,
          customerName: customer?.name || "Pengguna",
          customerEmail: customer?.email || "",
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
    if (!session || !hasPermission(session.role, "content.delete")) {
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
    if (!session || !hasPermission(session.role, "content.create")) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } }, { status: 403 });
    }
    const body = await request.json();
    const customerId = typeof body.customerId === "string" ? body.customerId : null;
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!customerId || !content || content.length > 2000) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Data tidak valid" } }, { status: 400 });
    }
    const orderId = typeof body.orderId === "string" ? body.orderId : null;

    const [created] = await db
      .insert(messages)
      .values({ senderId: session.userId, receiverId: customerId, orderId, content })
      .returning();

    return NextResponse.json({ success: true, item: { ...created, isMine: true } }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal mengirim balasan" } }, { status: 500 });
  }
}
