import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, orderStatusHistory, products, auditLogs } from "@/db/schema";
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

    // 2. Load and validate all products, calculate trusted prices
    const validatedItems: {
      productId: string;
      name: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      configuration: Record<string, unknown>;
      notes: string | undefined;
    }[] = [];

    for (const item of data.items) {
      const productResult = await db
        .select()
        .from(products)
        .where(and(eq(products.id, item.productId), eq(products.isActive, true)))
        .limit(1);

      const product = productResult[0];
      if (!product) {
        return NextResponse.json(
          { success: false, error: { code: "PRODUCT_NOT_FOUND", message: `Produk tidak ditemukan atau tidak aktif` } },
          { status: 400 }
        );
      }

      // Validate min order
      const minOrder = product.minOrder || 1;
      if (item.quantity < minOrder) {
        return NextResponse.json(
          { success: false, error: { code: "QUANTITY_ERROR", message: `${product.name}: Minimal order ${minOrder} ${product.unit}` } },
          { status: 400 }
        );
      }

      // Calculate trusted price
      let unitPrice = Number(product.basePrice);
      const productOptions = (product.options || []) as ProductOption[];

      for (const option of productOptions) {
        if (option.required && !item.selectedOptions[option.key]) {
          return NextResponse.json(
            { success: false, error: { code: "OPTION_REQUIRED", message: `${product.name}: ${option.name} wajib dipilih` } },
            { status: 400 }
          );
        }

        if ((option.type === "select" || option.type === "radio") && option.values) {
          const selectedValue = item.selectedOptions[option.key];
          if (selectedValue) {
            const optionVal = option.values.find((v) => v.value === selectedValue);
            if (!optionVal) {
              return NextResponse.json(
                { success: false, error: { code: "INVALID_OPTION", message: `${product.name}: Opsi ${option.name} tidak valid` } },
                { status: 400 }
              );
            }
            if (optionVal.priceModifier) {
              unitPrice += optionVal.priceModifier;
            }
          }
        }
      }

      const subtotal = unitPrice * item.quantity;

      validatedItems.push({
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        unitPrice,
        subtotal,
        configuration: item.selectedOptions,
        notes: item.notes,
      });
    }

    const orderSubtotal = validatedItems.reduce((sum, i) => sum + i.subtotal, 0);
    const orderTotal = orderSubtotal; // discount/shipping can be added later

    // 3. Create order transactionally
    const orderNumber = await generateOrderNumber();

    const result = await db.transaction(async (tx) => {
      // Create order
      const [newOrder] = await tx
        .insert(orders)
        .values({
          orderNumber,
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
          total: String(orderTotal),
          notes: data.notes,
        })
        .returning();

      // Create order items
      for (const item of validatedItems) {
        await tx.insert(orderItems).values({
          orderId: newOrder.id,
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: String(item.unitPrice),
          subtotal: String(item.subtotal),
          configuration: item.configuration,
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
