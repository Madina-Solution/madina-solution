"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Palette,
  Image,
  Star,
  MessageSquare,
  Ticket,
  Settings,
  FileText,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  HelpCircle,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { BRAND } from "@/lib/constants";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Commerce",
    items: [
      { href: "/admin/orders", label: "Pesanan", icon: ShoppingCart, exact: false },
      { href: "/admin/products", label: "Produk", icon: Package, exact: false },
      { href: "/admin/categories", label: "Kategori", icon: FolderTree, exact: false },
      { href: "/admin/coupons", label: "Kupon", icon: Ticket, exact: false },
    ],
  },
  {
    label: "Operasional",
    items: [
      { href: "/admin/design", label: "Desain", icon: Palette, exact: false },
      { href: "/admin/production", label: "Produksi", icon: Settings, exact: false },
    ],
  },
  {
    label: "Pelanggan",
    items: [
      { href: "/admin/customers", label: "Pelanggan", icon: Users, exact: false },
      { href: "/admin/reviews", label: "Ulasan", icon: Star, exact: false },
      { href: "/admin/messages", label: "Pesan", icon: MessageSquare, exact: false },
    ],
  },
  {
    label: "Konten",
    items: [
      { href: "/admin/services", label: "Layanan", icon: Briefcase, exact: false },
      { href: "/admin/portfolio", label: "Portfolio", icon: Image, exact: false },
      { href: "/admin/articles", label: "Artikel", icon: FileText, exact: false },
      { href: "/admin/faqs", label: "FAQ", icon: HelpCircle, exact: false },
    ],
  },
  {
    label: "Sistem",
    items: [
      { href: "/admin/settings", label: "Pengaturan", icon: Settings, exact: false },
      { href: "/admin/audit-logs", label: "Audit Log", icon: Shield, exact: false },
    ],
  },
];

const ADMIN_ROLES = ["super_admin", "admin", "manager", "staff", "designer", "production"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading && (!user || !ADMIN_ROLES.includes(user.role))) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (!user || !ADMIN_ROLES.includes(user.role)) return null;

  const handleLogout = async () => {
    await logout();
    toast({ type: "success", title: "Berhasil keluar" });
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-dark-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-dark/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-dark-200 bg-white transition-all duration-200 lg:relative lg:z-auto",
          collapsed ? "lg:w-[68px]" : "lg:w-64",
          sidebarOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-dark-100 px-4">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
                M
              </div>
              <span className="text-sm font-bold text-dark">Admin</span>
            </Link>
          )}
          {collapsed && (
            <Link href="/admin" className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
              M
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1 text-dark-400 hover:bg-dark-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin" aria-label="Admin navigation">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-6">
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-dark-400">
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-dark-600 hover:bg-dark-50 hover:text-dark",
                          collapsed && "justify-center px-2"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden border-t border-dark-100 p-3 lg:block">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-lg p-2 text-dark-400 transition-colors hover:bg-dark-50 hover:text-dark"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-dark-200 bg-white px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-dark-500 hover:bg-dark-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-sm font-semibold text-dark">
              {BRAND.name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-lg px-3 py-1.5 text-xs font-medium text-dark-500 transition-colors hover:bg-dark-100 hover:text-dark">
              Lihat Website
            </Link>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
