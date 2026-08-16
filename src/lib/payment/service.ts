import { db } from "@/db";
import { payments, paymentEvents, orders, auditLogs, notifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { PaymentProvider, CreatePaymentInput, PaymentResult } from "./types";
import { MockPaymentProvider } from "./mock-provider";

function getProvider(): PaymentProvider {
  // Future: check env for Midtrans/Xendit config
  // if (process.env.MIDTRANS_SERVER_KEY) return new MidtransProvider();
  return new MockPaymentProvider();
}

export class PaymentService {
  private provider: PaymentProvider;

  constructor() {
    this.provider = getProvider();
  }

  /**
   * Create a payment for an order. Amount is derived from database, never client.
   */
  async createPayment(orderId: string, actorId?: string): Promise<{ paymentId: string; result: PaymentResult }> {
    // Load order — authoritative amount
    const orderResult = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    const order = orderResult[0];
    if (!order) throw new Error("Order not found");

    const amount = Number(order.total);
    if (amount <= 0) throw new Error("Invalid order total");

    const input: CreatePaymentInput = {
      orderId,
      amount,
      currency: "IDR",
      customerEmail: order.guestEmail || undefined,
      customerName: order.guestName || undefined,
      description: `Pembayaran ${order.orderNumber}`,
      metadata: { orderNumber: order.orderNumber },
    };

    const result = await this.provider.createPayment(input);

    // Create payment record
    const [payment] = await db.insert(payments).values({
      orderId,
      provider: this.provider.name,
      providerPaymentId: result.providerPaymentId,
      reference: result.reference,
      amount: String(amount),
      currency: result.currency,
      status: result.status,
      paymentMethod: result.paymentMethod || null,
      expiresAt: result.expiresAt || null,
      metadata: result.metadata || {},
    }).returning();

    // Audit
    if (actorId) {
      await db.insert(auditLogs).values({
        userId: actorId,
        action: "PAYMENT_CREATED",
        resource: "payments",
        resourceId: payment.id,
        metadata: { orderId, amount, provider: this.provider.name },
      });
    }

    return { paymentId: payment.id, result };
  }

  /**
   * Process a webhook event idempotently.
   */
  async processWebhook(request: Request): Promise<{ processed: boolean }> {
    const event = await this.provider.verifyWebhook(request);

    // Idempotency check
    const existing = await db.select({ id: paymentEvents.id }).from(paymentEvents)
      .where(and(eq(paymentEvents.provider, this.provider.name), eq(paymentEvents.eventId, event.eventId)))
      .limit(1);

    if (existing.length > 0) {
      return { processed: false }; // Already processed
    }

    // Find payment
    const paymentResult = await db.select().from(payments)
      .where(eq(payments.providerPaymentId, event.providerPaymentId))
      .limit(1);

    const payment = paymentResult[0];
    if (!payment) {
      throw new Error("Payment not found for webhook");
    }

    // Transactional update
    await db.transaction(async (tx) => {
      // Record event
      await tx.insert(paymentEvents).values({
        paymentId: payment.id,
        provider: this.provider.name,
        eventId: event.eventId,
        eventType: event.eventType,
        payload: event.metadata || {},
        processed: true,
        processedAt: new Date(),
      });

      // Update payment status
      await tx.update(payments).set({
        status: event.status,
        paidAt: event.paidAt || null,
        updatedAt: new Date(),
      }).where(eq(payments.id, payment.id));

      // Map to order payment status
      let orderPaymentStatus: "unpaid" | "partial" | "paid" | "refunded" = "unpaid";
      if (event.status === "paid") orderPaymentStatus = "paid";
      else if (event.status === "refunded" || event.status === "partially_refunded") orderPaymentStatus = "refunded";

      if (orderPaymentStatus !== "unpaid") {
        await tx.update(orders).set({
          paymentStatus: orderPaymentStatus,
          updatedAt: new Date(),
        }).where(eq(orders.id, payment.orderId));
      }

      // Audit
      await tx.insert(auditLogs).values({
        action: `PAYMENT_${event.status.toUpperCase()}`,
        resource: "payments",
        resourceId: payment.id,
        metadata: { eventId: event.eventId, eventType: event.eventType, orderId: payment.orderId },
      });

      // Notify order owner
      const order = await tx.select({ userId: orders.userId, orderNumber: orders.orderNumber }).from(orders).where(eq(orders.id, payment.orderId)).limit(1);
      if (order[0]?.userId) {
        const title = event.status === "paid" ? "Pembayaran berhasil" : `Status pembayaran: ${event.status}`;
        await tx.insert(notifications).values({
          userId: order[0].userId,
          orderId: payment.orderId,
          type: `payment_${event.status}`,
          title,
          message: `Pembayaran untuk pesanan ${order[0].orderNumber} ${event.status === "paid" ? "telah berhasil" : `berstatus ${event.status}`}.`,
          channel: "in_app",
          status: "pending",
          sentAt: new Date(),
        });
      }
    });

    return { processed: true };
  }

  /**
   * Mark payment as paid manually (admin only).
   */
  async confirmManual(paymentId: string, actorId: string, reason: string): Promise<void> {
    const paymentResult = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
    const payment = paymentResult[0];
    if (!payment) throw new Error("Payment not found");

    await db.transaction(async (tx) => {
      await tx.update(payments).set({ status: "paid", paidAt: new Date(), updatedAt: new Date() }).where(eq(payments.id, paymentId));
      await tx.update(orders).set({ paymentStatus: "paid", updatedAt: new Date() }).where(eq(orders.id, payment.orderId));
      await tx.insert(auditLogs).values({
        userId: actorId,
        action: "PAYMENT_MANUAL_CONFIRMED",
        resource: "payments",
        resourceId: paymentId,
        metadata: { orderId: payment.orderId, reason },
      });
    });
  }
}
