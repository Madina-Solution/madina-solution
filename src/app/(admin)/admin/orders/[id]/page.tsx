import { notFound } from "next/navigation";
import { db } from "@/db";
import { orders, orderItems, orderStatusHistory, payments, designRevisions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Mail, Clock, CreditCard, Palette } from "lucide-react";
import { OrderStatusActions } from "./order-status-actions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Menunggu Konfirmasi", color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Dikonfirmasi", color: "bg-blue-100 text-blue-700" },
  design_review: { label: "Review Desain", color: "bg-purple-100 text-purple-700" },
  design_approved: { label: "Desain Disetujui", color: "bg-indigo-100 text-indigo-700" },
  production: { label: "Produksi", color: "bg-orange-100 text-orange-700" },
  quality_control: { label: "Quality Control", color: "bg-cyan-100 text-cyan-700" },
  ready: { label: "Siap Diambil/Kirim", color: "bg-teal-100 text-teal-700" },
  shipping: { label: "Dalam Pengiriman", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Selesai", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-700" },
};

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;

  const orderResult = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  const order = orderResult[0];
  if (!order) notFound();

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  const history = await db.select().from(orderStatusHistory).where(eq(orderStatusHistory.orderId, id)).orderBy(desc(orderStatusHistory.createdAt));
  const paymentList = await db.select().from(payments).where(eq(payments.orderId, id)).orderBy(desc(payments.createdAt));
  const revisions = await db.select().from(designRevisions).where(eq(designRevisions.orderId, id)).orderBy(desc(designRevisions.revisionNumber));

  const statusInfo = STATUS_LABELS[order.status] || { label: order.status, color: "bg-dark-100 text-dark-600" };
  const address = order.shippingAddress as { recipientName?: string; phone?: string; address?: string; city?: string; province?: string; district?: string; postalCode?: string } | null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="rounded-lg p-2 text-dark-500 transition-colors hover:bg-dark-100 hover:text-dark">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-dark">{order.orderNumber}</h1>
          <p className="mt-0.5 text-sm text-dark-500">{formatDate(order.createdAt)}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <div className="rounded-2xl border border-dark-100 bg-white p-6">
            <h2 className="font-semibold text-dark">Produk</h2>
            <div className="mt-4 space-y-4">
              {items.map((item) => {
                const config = item.configuration as Record<string, unknown> || {};
                return (
                  <div key={item.id} className="flex gap-4 rounded-xl border border-dark-100 p-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-dark-50 text-lg font-bold text-dark-300">
                      {item.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-dark">{item.name}</p>
                      {Object.keys(config).length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {Object.entries(config).map(([key, val]) => (
                            <span key={key} className="rounded bg-dark-50 px-1.5 py-0.5 text-xs text-dark-600">
                              {key}: {String(val)}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-dark-500">
                          {item.quantity} × {formatCurrency(Number(item.unitPrice))}
                        </span>
                        <span className="font-semibold text-dark">{formatCurrency(Number(item.subtotal))}</span>
                      </div>
                      {item.notes && <p className="mt-1 text-xs text-dark-500">Catatan: {item.notes}</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="mt-4 space-y-2 border-t border-dark-100 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-dark-500">Subtotal</span>
                <span className="text-dark">{formatCurrency(Number(order.subtotal))}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500">Diskon</span>
                  <span className="text-green-600">-{formatCurrency(Number(order.discount))}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-dark-100 pt-2 text-lg font-bold">
                <span className="text-dark">Total</span>
                <span className="text-primary">{formatCurrency(Number(order.total))}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-dark-100 bg-white p-6">
            <h2 className="font-semibold text-dark">Timeline</h2>
            <div className="mt-4 space-y-4">
              {history.map((entry, i) => {
                const info = STATUS_LABELS[entry.status] || { label: entry.status, color: "" };
                return (
                  <div key={entry.id} className="flex gap-4">
                    <div className="relative flex flex-col items-center">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${i === 0 ? "bg-primary text-white" : "bg-dark-100 text-dark-400"}`}>
                        <Clock className="h-4 w-4" />
                      </div>
                      {i < history.length - 1 && <div className="w-0.5 flex-1 bg-dark-200" />}
                    </div>
                    <div className="pb-4">
                      <p className="font-medium text-dark">{info.label}</p>
                      {entry.notes && <p className="mt-0.5 text-sm text-dark-500">{entry.notes}</p>}
                      <p className="mt-0.5 text-xs text-dark-400">{formatDate(entry.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          {/* Status Actions */}
          <OrderStatusActions orderId={order.id} currentStatus={order.status} />

          {/* Customer */}
          <div className="rounded-2xl border border-dark-100 bg-white p-6">
            <h2 className="font-semibold text-dark">Pelanggan</h2>
            <div className="mt-4 space-y-3">
              {order.guestName && <p className="font-medium text-dark">{order.guestName}</p>}
              {order.guestEmail && (
                <div className="flex items-center gap-2 text-sm text-dark-600">
                  <Mail className="h-4 w-4 text-dark-400" />
                  {order.guestEmail}
                </div>
              )}
              {order.guestPhone && (
                <div className="flex items-center gap-2 text-sm text-dark-600">
                  <Phone className="h-4 w-4 text-dark-400" />
                  {order.guestPhone}
                </div>
              )}
            </div>
          </div>

          {/* Delivery */}
          <div className="rounded-2xl border border-dark-100 bg-white p-6">
            <h2 className="font-semibold text-dark">Pengiriman</h2>
            <p className="mt-2 text-sm capitalize text-dark-600">
              Metode: {order.deliveryMethod || "delivery"}
            </p>
            {address && (
              <div className="mt-3 flex gap-2 text-sm text-dark-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-dark-400" />
                <div>
                  <p className="font-medium text-dark">{address.recipientName}</p>
                  <p>{address.address}</p>
                  <p>{[address.district, address.city, address.province].filter(Boolean).join(", ")}</p>
                  {address.postalCode && <p>{address.postalCode}</p>}
                  {address.phone && <p className="mt-1">{address.phone}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="rounded-2xl border border-dark-100 bg-white p-6">
              <h2 className="font-semibold text-dark">Catatan</h2>
              <p className="mt-2 text-sm text-dark-600">{order.notes}</p>
            </div>
          )}

          {/* Payment */}
          <div className="rounded-2xl border border-dark-100 bg-white p-6">
            <h2 className="flex items-center gap-2 font-semibold text-dark"><CreditCard className="h-4 w-4" /> Pembayaran</h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-500">Status</span>
                <span className={`font-semibold ${order.paymentStatus === "paid" ? "text-green-600" : "text-red-600"}`}>
                  {order.paymentStatus === "paid" ? "Lunas" : order.paymentStatus === "refunded" ? "Refund" : "Belum Bayar"}
                </span>
              </div>
              {paymentList.length > 0 && paymentList.map((p) => (
                <div key={p.id} className="rounded-lg bg-dark-50 p-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-dark-500">Provider</span>
                    <span className="font-medium text-dark">{p.provider}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-xs">
                    <span className="text-dark-500">Amount</span>
                    <span className="font-medium text-dark">{formatCurrency(Number(p.amount))}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-xs">
                    <span className="text-dark-500">Status</span>
                    <span className="font-medium text-dark capitalize">{p.status}</span>
                  </div>
                  {p.paidAt && (
                    <div className="mt-1 flex justify-between text-xs">
                      <span className="text-dark-500">Dibayar</span>
                      <span className="text-dark">{formatDate(p.paidAt)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Design Revisions */}
          {revisions.length > 0 && (
            <div className="rounded-2xl border border-dark-100 bg-white p-6">
              <h2 className="flex items-center gap-2 font-semibold text-dark"><Palette className="h-4 w-4" /> Desain</h2>
              <div className="mt-3 space-y-2">
                {revisions.map((rev) => (
                  <div key={rev.id} className="rounded-lg bg-dark-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-dark">Revisi #{rev.revisionNumber}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${rev.status === "approved" ? "bg-green-100 text-green-700" : rev.status === "revision_requested" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                        {rev.status === "approved" ? "Disetujui" : rev.status === "revision_requested" ? "Revisi" : rev.status}
                      </span>
                    </div>
                    {rev.notes && <p className="mt-1 text-xs text-dark-500">{rev.notes}</p>}
                    {rev.customerFeedback && <p className="mt-1 text-xs text-dark-600">Feedback: {rev.customerFeedback}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
