import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getSession } from "@/lib/auth/session";
import { orders, orderItems, orderStatusHistory, products, services, media, auditLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { checkoutSchema } from "@/lib/validations/checkout";
import { generateOrderNumber } from "@/lib/order-number";
import type { ProductOption } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validate payload
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Data tidak valid", details: parsed.error.issues } },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const session = await getSession();

    // 2. Load and validate all products, calculate trusted prices
    const validatedItems: {
      productId: string | null;
      serviceId: string | null;
      name: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      configuration: Record<string, unknown>;
      notes: string | undefined;
      designFiles: string[];
      fulfillmentType: "physical" | "digital" | "hybrid";
    }[] = [];

    for (const item of data.items) {
      if (item.productId) {
        const productResult = await db.select().from(products).where(and(eq(products.id, item.productId), eq(products.isActive, true))).limit(1);
        const product = productResult[0];
        if (!product) return NextResponse.json({ success: false, error: { code: "PRODUCT_NOT_FOUND", message: "Produk tidak ditemukan atau tidak aktif" } }, { status: 400 });

        const minOrder = product.minOrder || 1;
        if (item.quantity < minOrder) return NextResponse.json({ success: false, error: { code: "QUANTITY_ERROR", message: `${product.name}: Minimal order ${minOrder} ${product.unit}` } }, { status: 400 });

        let unitPrice = Number(product.basePrice);
        const productOptions = (product.options || []) as ProductOption[];
        const designFiles: string[] = [];

        for (const option of productOptions) {
          if (option.required && !item.selectedOptions[option.key]) return NextResponse.json({ success: false, error: { code: "OPTION_REQUIRED", message: `${product.name}: ${option.name} wajib dipilih` } }, { status: 400 });
          if ((option.type === "select" || option.type === "radio") && option.values) {
            const selectedValue = item.selectedOptions[option.key];
            if (selectedValue) {
              const optionVal = option.values.find((v) => v.value === selectedValue);
              if (!optionVal) return NextResponse.json({ success: false, error: { code: "INVALID_OPTION", message: `${product.name}: Opsi ${option.name} tidak valid` } }, { status: 400 });
              if (optionVal.priceModifier) unitPrice += optionVal.priceModifier;
            }
          }
          if (option.type === "file" && item.selectedOptions[option.key]) designFiles.push(item.selectedOptions[option.key]);
        }

        if (designFiles.length > 0 && session) {
          const owned = await db.select({ url: media.url }).from(media).where(and(eq(media.userId, session.userId), eq(media.purpose, "customer_upload"), eq(media.status, "uploaded")));
          const allowed = new Set(owned.map((m) => m.url));
          if (designFiles.some((url) => !allowed.has(url))) return NextResponse.json({ success: false, error: { code: "INVALID_UPLOAD_REFERENCE", message: "Salah satu file lampiran tidak valid atau bukan milik akun Anda" } }, { status: 400 });
        }

        const subtotal = unitPrice * item.quantity;
        validatedItems.push({ productId: product.id, serviceId: null, name: product.name, quantity: item.quantity, unitPrice, subtotal, configuration: item.selectedOptions, notes: item.notes, designFiles, fulfillmentType: (product.fulfillmentType || "physical") as "physical" | "digital" | "hybrid" });
      } else if (item.serviceId) {
        const serviceResult = await db.select().from(services).where(and(eq(services.id, item.serviceId), eq(services.isActive, true))).limit(1);
        const service = serviceResult[0];
        if (!service) return NextResponse.json({ success: false, error: { code: "SERVICE_NOT_FOUND", message: "Layanan tidak ditemukan atau tidak aktif" } }, { status: 400 });

        let unitPrice = Number(service.startingPrice || 0);
        const serviceOptions = (service.options || []) as ProductOption[];
        const designFiles: string[] = [];
        for (const option of serviceOptions) {
          if (option.required && !item.selectedOptions[option.key]) return NextResponse.json({ success: false, error: { code: "OPTION_REQUIRED", message: `${service.name}: ${option.name} wajib diisi` } }, { status: 400 });
          if ((option.type === "select" || option.type === "radio") && option.values) {
            const selectedValue = item.selectedOptions[option.key];
            if (selectedValue) {
              const optionVal = option.values.find((v) => v.value === selectedValue);
              if (!optionVal) return NextResponse.json({ success: false, error: { code: "INVALID_OPTION", message: `${service.name}: Opsi ${option.name} tidak valid` } }, { status: 400 });
              if (optionVal.priceModifier) unitPrice += optionVal.priceModifier;
            }
          }
          if (option.type === "file" && item.selectedOptions[option.key]) designFiles.push(item.selectedOptions[option.key]);
        }
        if (designFiles.length > 0 && session) {
          const owned = await db.select({ url: media.url }).from(media).where(and(eq(media.userId, session.userId), eq(media.purpose, "customer_upload"), eq(media.status, "uploaded")));
          const allowed = new Set(owned.map((m) => m.url));
          if (designFiles.some((url) => !allowed.has(url))) return NextResponse.json({ success: false, error: { code: "INVALID_UPLOAD_REFERENCE", message: "Salah satu file lampiran tidak valid atau bukan milik akun Anda" } }, { status: 400 });
        }
        const subtotal = unitPrice * item.quantity;
        validatedItems.push({ productId: null, serviceId: service.id, name: service.name, quantity: item.quantity, unitPrice, subtotal, configuration: item.selectedOptions, notes: item.notes, designFiles, fulfillmentType: (service.fulfillmentType || "physical") as "physical" | "digital" | "hybrid" });
      }
    }

    const orderSubtotal = validatedItems.reduce((sum, i) => sum + i.subtotal, 0);

    // Apply coupon if provided
    let orderDiscount = 0;
    let couponId: string | null = null;
    if (data.couponCode) {
      const { coupons: couponsTable } = await import("@/db/schema");
      const { eq: eqOp, and: andOp } = await import("drizzle-orm");
      const [coupon] = await db.select().from(couponsTable).where(andOp(eqOp(couponsTable.code, data.couponCode.toUpperCase()), eqOp(couponsTable.isActive, true))).limit(1);
      if (coupon) {
        if (coupon.discountType === "percentage") {
          orderDiscount = (orderSubtotal * Number(coupon.discountValue)) / 100;
          if (coupon.maxDiscount) orderDiscount = Math.min(orderDiscount, Number(coupon.maxDiscount));
        } else {
          orderDiscount = Number(coupon.discountValue);
        }
        orderDiscount = Math.min(orderDiscount, orderSubtotal);
        couponId = coupon.id;
        // Increment usage
        await db.update(couponsTable).set({ usageCount: (coupon.usageCount || 0) + 1 }).where(eqOp(couponsTable.id, coupon.id));
      }
    }

    const orderTotal = orderSubtotal - orderDiscount;

    // 3. Create order transactionally
    const orderNumber = await generateOrderNumber();

    const result = await db.transaction(async (tx) => {
      // Create order
      const [newOrder] = await tx
        .insert(orders)
        .values({
          orderNumber,
          userId: session?.userId || null,
          guestName: data.customer.name,
          guestEmail: data.customer.email,
          guestPhone: data.customer.phone,
          guestWhatsapp: data.customer.whatsapp || data.customer.phone,
          shippingAddress: data.deliveryMethod === "delivery" ? {
            recipientName: data.address.recipientName,
            phone: data.address.phone,
            address: data.address.address,
            city: data.address.city,
            province: data.address.province,
            district: data.address.district,
            postalCode: data.address.postalCode,
          } : null,
          deliveryMethod: data.deliveryMethod,
          status: "pending",
          paymentStatus: "unpaid",
          subtotal: String(orderSubtotal),
          discount: String(orderDiscount),
          total: String(orderTotal),
          couponId,
          notes: data.notes,
        })
        .returning();

      // Create order items
      for (const item of validatedItems) {
        await tx.insert(orderItems).values({
          orderId: newOrder.id,
          productId: item.productId,
          serviceId: item.serviceId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: String(item.unitPrice),
          subtotal: String(item.subtotal),
          configuration: item.configuration,
          designFiles: item.designFiles,
          fulfillmentType: item.fulfillmentType,
          notes: item.notes,
        });
      }

      // Create status history
      await tx.insert(orderStatusHistory).values({
        orderId: newOrder.id,
        status: "pending",
        notes: "Pesanan dibuat",
      });

      // Create audit log
      await tx.insert(auditLogs).values({
        action: "ORDER_CREATED",
        resource: "orders",
        resourceId: newOrder.id,
        userId: session?.userId || undefined,
        metadata: {
          orderNumber,
          itemCount: validatedItems.length,
          total: orderTotal,
          customerEmail: data.customer.email,
        },
      });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      order: {
        id: result.id,
        orderNumber: result.orderNumber,
        status: result.status,
        total: Number(result.total),
        createdAt: result.createdAt,
      },
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Gagal membuat pesanan. Silakan coba lagi." } },
      { status: 500 }
    );
  }
}
