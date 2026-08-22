import { db } from "@/db";
import { orders, products, users, orderItems } from "@/db/schema";
import { eq, count, sum, desc, sql } from "drizzle-orm";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import {
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Fetch real metrics from database
  const [
    totalOrdersResult,
    pendingOrdersResult,
    completedOrdersResult,
    totalRevenueResult,
    totalProductsResult,
    totalCustomersResult,
    recentOrdersList,
  ] = await Promise.all([
    db.select({ value: count() }).from(orders),
    db.select({ value: count() }).from(orders).where(eq(orders.status, "pending")),
    db.select({ value: count() }).from(orders).where(eq(orders.status, "completed")),
    db.select({ value: sum(orders.total) }).from(orders),
    db.select({ value: count() }).from(products).where(eq(products.isActive, true)),
    db.select({ value: count() }).from(users).where(eq(users.role, "customer")),
    db.select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      guestName: orders.guestName,
      guestEmail: orders.guestEmail,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      total: orders.total,
      createdAt: orders.createdAt,
    })
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(5),
  ]);

  const totalOrders = totalOrdersResult[0]?.value ?? 0;
  const pendingOrders = pendingOrdersResult[0]?.value ?? 0;
  const completedOrders = completedOrdersResult[0]?.value ?? 0;
  const totalRevenue = Number(totalRevenueResult[0]?.value ?? 0);
  const totalProducts = totalProductsResult[0]?.value ?? 0;
  const totalCustomers = totalCustomersResult[0]?.value ?? 0;

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: "Menunggu", color: "bg-yellow-100 text-yellow-700" },
    confirmed: { label: "Dikonfirmasi", color: "bg-blue-100 text-blue-700" },
    design_review: { label: "Review Desain", color: "bg-purple-100 text-purple-700" },
    design_approved: { label: "Desain OK", color: "bg-indigo-100 text-indigo-700" },
    production: { label: "Produksi", color: "bg-orange-100 text-orange-700" },
    quality_control: { label: "QC", color: "bg-cyan-100 text-cyan-700" },
    ready: { label: "Siap", color: "bg-teal-100 text-teal-700" },
    shipping: { label: "Dikirim", color: "bg-blue-100 text-blue-700" },
    completed: { label: "Selesai", color: "bg-green-100 text-green-700" },
    cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-700" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark">Dashboard</h1>
        <p className="mt-1 text-dark-500">Ringkasan bisnis Madina Solution</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-dark-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-500">Total Revenue</p>
              <p className="mt-1 text-2xl font-bold text-dark">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-dark-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-500">Total Pesanan</p>
              <p className="mt-1 text-2xl font-bold text-dark">{totalOrders}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <ShoppingCart className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-dark-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-500">Produk Aktif</p>
              <p className="mt-1 text-2xl font-bold text-dark">{totalProducts}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <Package className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-dark-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-500">Menunggu Konfirmasi</p>
              <p className="mt-1 text-2xl font-bold text-dark">{pendingOrders}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-2xl border border-dark-100 bg-white">
        <div className="flex items-center justify-between border-b border-dark-100 px-6 py-4">
          <h2 className="font-semibold text-dark">Pesanan Terbaru</h2>
          <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Lihat Semua <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {recentOrdersList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-100 text-left">
                  <th className="px-6 py-3 font-medium text-dark-500">No. Pesanan</th>
                  <th className="px-6 py-3 font-medium text-dark-500">Pelanggan</th>
                  <th className="px-6 py-3 font-medium text-dark-500">Status</th>
                  <th className="px-6 py-3 font-medium text-dark-500">Pembayaran</th>
                  <th className="px-6 py-3 text-right font-medium text-dark-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrdersList.map((order) => {
                  const statusInfo = STATUS_LABELS[order.status] || { label: order.status, color: "bg-dark-100 text-dark-700" };
                  return (
                    <tr key={order.id} className="border-b border-dark-50 last:border-0">
                      <td className="px-6 py-3">
                        <Link href={`/admin/orders/${order.id}`} className="font-medium text-primary hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-dark-600">{order.guestName || "—"}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {order.paymentStatus === "paid" ? "Lunas" : "Belum Bayar"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-medium text-dark">
                        {formatCurrency(Number(order.total))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-dark-500">
            Belum ada pesanan.
          </div>
        )}
      </div>
    </div>
  );
}
