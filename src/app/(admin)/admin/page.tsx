import { db } from "@/db";
import { orders, products, services, users, orderItems, messages, reviews, coupons } from "@/db/schema";
import { eq, count, sum, desc, sql, gte, lt, and, or, isNull } from "drizzle-orm";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  Clock,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Mail,
  MessageSquare,
  Star,
  Ticket,
  Briefcase,
  Plus,
  FileText,
  AlertCircle,
} from "lucide-react";
import { RevenueChart } from "./revenue-chart";
import { PipelineChart } from "./pipeline-chart";

export const dynamic = "force-dynamic";

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

// Group the 10 detailed order statuses into 6 readable pipeline stages for the chart.
const PIPELINE_GROUPS: { stage: string; statuses: string[] }[] = [
  { stage: "Menunggu", statuses: ["draft", "pending"] },
  { stage: "Konfirmasi", statuses: ["confirmed"] },
  { stage: "Desain", statuses: ["design_review", "design_approved"] },
  { stage: "Produksi", statuses: ["production", "quality_control", "ready"] },
  { stage: "Pengiriman", statuses: ["shipping"] },
  { stage: "Selesai", statuses: ["completed"] },
];

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function TrendBadge({ value }: { value: number | null }) {
  if (value === null) return null;
  const isUp = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isUp ? "text-green-600" : "text-red-600"}`}>
      {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(value)}%
    </span>
  );
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const start30d = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
  start30d.setHours(0, 0, 0, 0);

  const [
    revenueThisMonth,
    revenueLastMonth,
    ordersThisMonth,
    ordersLastMonth,
    customersThisMonth,
    customersLastMonth,
    totalProductsResult,
    totalServicesResult,
    pendingOrdersResult,
    unreadMessagesResult,
    pendingReviewsResult,
    activeCouponsResult,
    dailyRevenueRows,
    statusBreakdownRows,
    topProductsRows,
    recentOrdersList,
    recentMessagesList,
    recentReviewsList,
  ] = await Promise.all([
    db.select({ value: sum(orders.total) }).from(orders).where(gte(orders.createdAt, startOfThisMonth)),
    db.select({ value: sum(orders.total) }).from(orders).where(and(gte(orders.createdAt, startOfLastMonth), lt(orders.createdAt, startOfThisMonth))),
    db.select({ value: count() }).from(orders).where(gte(orders.createdAt, startOfThisMonth)),
    db.select({ value: count() }).from(orders).where(and(gte(orders.createdAt, startOfLastMonth), lt(orders.createdAt, startOfThisMonth))),
    db.select({ value: count() }).from(users).where(and(eq(users.role, "customer"), gte(users.createdAt, startOfThisMonth))),
    db.select({ value: count() }).from(users).where(and(eq(users.role, "customer"), gte(users.createdAt, startOfLastMonth), lt(users.createdAt, startOfThisMonth))),
    db.select({ value: count() }).from(products).where(eq(products.isActive, true)),
    db.select({ value: count() }).from(services).where(eq(services.isActive, true)),
    db.select({ value: count() }).from(orders).where(eq(orders.status, "pending")),
    db.select({ value: count() }).from(messages).where(eq(messages.isRead, false)),
    db.select({ value: count() }).from(reviews).where(eq(reviews.isApproved, false)),
    db.select({ value: count() }).from(coupons).where(and(eq(coupons.isActive, true), or(isNull(coupons.endDate), gte(coupons.endDate, now)))),
    db
      .select({ day: sql<string>`to_char(date_trunc('day', ${orders.createdAt}), 'YYYY-MM-DD')`, revenue: sum(orders.total) })
      .from(orders)
      .where(gte(orders.createdAt, start30d))
      .groupBy(sql`1`)
      .orderBy(sql`1`),
    db.select({ status: orders.status, value: count() }).from(orders).groupBy(orders.status),
    db
      .select({ productId: orderItems.productId, name: sql<string>`max(${orderItems.name})`, orderCount: count(), revenue: sum(orderItems.subtotal) })
      .from(orderItems)
      .where(sql`${orderItems.productId} is not null`)
      .groupBy(orderItems.productId)
      .orderBy(desc(count()))
      .limit(5),
    db
      .select({ id: orders.id, orderNumber: orders.orderNumber, guestName: orders.guestName, guestEmail: orders.guestEmail, status: orders.status, paymentStatus: orders.paymentStatus, total: orders.total, createdAt: orders.createdAt })
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(5),
    db
      .select({ id: messages.id, content: messages.content, createdAt: messages.createdAt, senderName: users.name })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .orderBy(desc(messages.createdAt))
      .limit(3),
    db
      .select({ id: reviews.id, rating: reviews.rating, comment: reviews.comment, createdAt: reviews.createdAt, userName: users.name })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .orderBy(desc(reviews.createdAt))
      .limit(3),
  ]);

  const revenueThisMonthNum = Number(revenueThisMonth[0]?.value ?? 0);
  const revenueLastMonthNum = Number(revenueLastMonth[0]?.value ?? 0);
  const ordersThisMonthNum = ordersThisMonth[0]?.value ?? 0;
  const ordersLastMonthNum = ordersLastMonth[0]?.value ?? 0;
  const customersThisMonthNum = customersThisMonth[0]?.value ?? 0;
  const customersLastMonthNum = customersLastMonth[0]?.value ?? 0;
  const totalProducts = totalProductsResult[0]?.value ?? 0;
  const totalServices = totalServicesResult[0]?.value ?? 0;
  const pendingOrders = pendingOrdersResult[0]?.value ?? 0;
  const unreadMessages = unreadMessagesResult[0]?.value ?? 0;
  const pendingReviews = pendingReviewsResult[0]?.value ?? 0;
  const activeCoupons = activeCouponsResult[0]?.value ?? 0;

  // Fill in any missing days in the last 30 days with 0 revenue, so the chart has a continuous line.
  const revenueByDay = new Map(dailyRevenueRows.map((r) => [r.day, Number(r.revenue ?? 0)]));
  const revenueChartData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(start30d.getTime() + i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    return { date: `${d.getDate()}/${d.getMonth() + 1}`, revenue: revenueByDay.get(key) ?? 0 };
  });

  const statusCounts: Map<string, number> = new Map(statusBreakdownRows.map((r) => [r.status, r.value]));
  const pipelineChartData = PIPELINE_GROUPS.map((group) => ({
    stage: group.stage,
    count: group.statuses.reduce((sum, s) => sum + (statusCounts.get(s) ?? 0), 0),
  }));
  const cancelledCount = statusCounts.get("cancelled") ?? 0;

  const recentActivity = [
    ...recentOrdersList.map((o) => ({ type: "order" as const, id: o.id, title: `Pesanan baru ${o.orderNumber}`, subtitle: o.guestName || o.guestEmail || "Pelanggan", createdAt: o.createdAt, href: `/admin/orders/${o.id}` })),
    ...recentMessagesList.map((m) => ({ type: "message" as const, id: m.id, title: `Pesan dari ${m.senderName || "Pengguna"}`, subtitle: m.content.slice(0, 60), createdAt: m.createdAt, href: "/admin/messages" })),
    ...recentReviewsList.map((r) => ({ type: "review" as const, id: r.id, title: `Review ${r.rating}\u2605 dari ${r.userName || "Pengguna"}`, subtitle: r.comment?.slice(0, 60) || "Tanpa komentar", createdAt: r.createdAt, href: "/admin/reviews" })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

  const needsAttention = [
    { count: pendingOrders, label: "pesanan menunggu konfirmasi", href: "/admin/orders?status=pending", icon: Clock, color: "text-yellow-600 bg-yellow-100" },
    { count: unreadMessages, label: "pesan belum dibaca", href: "/admin/messages", icon: Mail, color: "text-blue-600 bg-blue-100" },
    { count: pendingReviews, label: "review menunggu persetujuan", href: "/admin/reviews", icon: Star, color: "text-purple-600 bg-purple-100" },
  ].filter((item) => item.count > 0);

  const stats = [
    { label: "Pendapatan Bulan Ini", value: formatCurrency(revenueThisMonthNum), trend: pctChange(revenueThisMonthNum, revenueLastMonthNum), icon: DollarSign, color: "bg-green-100 text-green-600" },
    { label: "Pesanan Bulan Ini", value: String(ordersThisMonthNum), trend: pctChange(ordersThisMonthNum, ordersLastMonthNum), icon: ShoppingCart, color: "bg-blue-100 text-blue-600" },
    { label: "Pelanggan Baru", value: String(customersThisMonthNum), trend: pctChange(customersThisMonthNum, customersLastMonthNum), icon: Users, color: "bg-indigo-100 text-indigo-600" },
    { label: "Menunggu Konfirmasi", value: String(pendingOrders), trend: null, icon: Clock, color: "bg-yellow-100 text-yellow-600" },
    { label: "Produk Aktif", value: String(totalProducts), trend: null, icon: Package, color: "bg-purple-100 text-purple-600" },
    { label: "Layanan Aktif", value: String(totalServices), trend: null, icon: Briefcase, color: "bg-orange-100 text-orange-600" },
    { label: "Pesan Belum Dibaca", value: String(unreadMessages), trend: null, icon: Mail, color: "bg-cyan-100 text-cyan-600" },
    { label: "Kupon Aktif", value: String(activeCoupons), trend: null, icon: Ticket, color: "bg-pink-100 text-pink-600" },
  ];

  const quickActions = [
    { label: "Tambah Produk", href: "/admin/products", icon: Plus },
    { label: "Tulis Artikel", href: "/admin/articles", icon: FileText },
    { label: "Lihat Pesan Masuk", href: "/admin/messages", icon: MessageSquare },
    { label: "Kelola Kupon", href: "/admin/coupons", icon: Ticket },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark">Dashboard</h1>
        <p className="mt-1 text-dark-500">Ringkasan bisnis Madina Solution &mdash; {formatDate(now)}</p>
      </div>

      {/* Needs Attention */}
      {needsAttention.length > 0 && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-dark"><AlertCircle className="h-4 w-4 text-primary" />Perlu Perhatian</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {needsAttention.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.label} href={item.href} className="flex items-center gap-3 rounded-xl border border-dark-100 bg-white p-3 transition hover:border-primary/30 hover:shadow-sm">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.color}`}><Icon className="h-4 w-4" /></span>
                  <span className="min-w-0"><span className="block font-bold text-dark">{item.count}</span><span className="block truncate text-xs text-dark-500">{item.label}</span></span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-dark-100 bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm text-dark-500">{s.label}</p>
                  <p className="mt-1 truncate text-2xl font-bold text-dark">{s.value}</p>
                  {s.trend !== null && <div className="mt-1"><TrendBadge value={s.trend} /> <span className="text-xs text-dark-400">vs bulan lalu</span></div>}
                </div>
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${s.color}`}><Icon className="h-6 w-6" /></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-dark-100 bg-white p-6 lg:col-span-2">
          <h2 className="font-semibold text-dark">Tren Pendapatan (30 Hari Terakhir)</h2>
          <div className="mt-4"><RevenueChart data={revenueChartData} /></div>
        </div>
        <div className="rounded-2xl border border-dark-100 bg-white p-6">
          <h2 className="font-semibold text-dark">Pipeline Pesanan</h2>
          {cancelledCount > 0 && <p className="mt-0.5 text-xs text-dark-400">{cancelledCount} pesanan dibatalkan (tidak ditampilkan)</p>}
          <div className="mt-4"><PipelineChart data={pipelineChartData} /></div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-dark-100 bg-white p-6">
        <h2 className="font-semibold text-dark">Aksi Cepat</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.href} href={a.href} className="flex items-center gap-3 rounded-xl border border-dark-100 p-4 transition-colors hover:border-primary/20 hover:bg-primary/5">
                <Icon className="h-5 w-5 shrink-0 text-primary" /><span className="truncate font-medium text-dark">{a.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Products */}
        <div className="rounded-2xl border border-dark-100 bg-white p-6">
          <h2 className="font-semibold text-dark">Produk Terlaris</h2>
          {topProductsRows.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {topProductsRows.map((p, i) => (
                <li key={p.productId ?? i} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-dark">{p.name}</p><p className="text-xs text-dark-400">{p.orderCount} pesanan</p></div>
                  <span className="shrink-0 text-sm font-semibold text-dark">{formatCurrency(Number(p.revenue ?? 0))}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-dark-400">Belum ada data penjualan.</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-dark-100 bg-white p-6 lg:col-span-2">
          <h2 className="font-semibold text-dark">Aktivitas Terbaru</h2>
          {recentActivity.length > 0 ? (
            <ul className="mt-4 space-y-1">
              {recentActivity.map((item) => (
                <li key={`${item.type}-${item.id}`}>
                  <Link href={item.href} className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-dark-50">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.type === "order" ? "bg-blue-100 text-blue-600" : item.type === "message" ? "bg-cyan-100 text-cyan-600" : "bg-purple-100 text-purple-600"}`}>
                      {item.type === "order" ? <ShoppingCart className="h-4 w-4" /> : item.type === "message" ? <Mail className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-dark">{item.title}</p><p className="truncate text-xs text-dark-400">{item.subtitle}</p></div>
                    <span className="shrink-0 text-xs text-dark-400">{formatDate(item.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-dark-400">Belum ada aktivitas.</p>
          )}
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
                      <td className="px-6 py-3 text-dark-600">{order.guestName || "\u2014"}</td>
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
