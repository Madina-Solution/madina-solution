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
  LayoutGrid,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteImage } from "@/components/ui/site-image";
import { hasPermission, Permission } from "@/lib/auth/permissions";
import { getAdminRoutePermission } from "@/lib/auth/admin-routes";

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
      { href: "/admin/navigation", label: "Mega Menu", icon: LayoutGrid, exact: false },
    ],
  },
  {
    label: "Sistem",
    items: [
      { href: "/admin/users", label: "Users & Roles", icon: Users, exact: false },
      { href: "/admin/media", label: "Media", icon: Image, exact: false },
      { href: "/admin/settings", label: "Pengaturan", icon: Settings, exact: false },
      { href: "/admin/audit-logs", label: "Audit Log", icon: Shield, exact: false },
    ],
  },
];

const ADMIN_ROLES = ["super_admin", "admin", "manager", "staff", "designer", "production"];

type AdminShellProps = { children: React.ReactNode; siteName: string; siteLogo?: string };

export function AdminShell({ children, siteName, siteLogo = "" }: AdminShellProps) {
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

  const canSee = (href: string) => hasPermission(user.role, getAdminRoutePermission(href));

  const canAccessCurrentRoute = () => hasPermission(user.role, getAdminRoutePermission(pathname));

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
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-dark-200 bg-white transition-all duration-200 lg:z-40",
          collapsed ? "lg:w-[68px]" : "lg:w-64",
          sidebarOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Full branding (logo + name) shows whenever the sidebar isn't in
           its narrow desktop rail state — that covers both the mobile
           drawer (always full width, never "collapsed") and the expanded
           desktop sidebar. Icon-only applies only to the collapsed rail. */}
        <div className="flex h-16 items-center justify-between border-b border-dark-100 px-4">
          {collapsed ? (
            <Link href="/admin" className="relative mx-auto flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dark-100 bg-white" aria-label={siteName}>
              {siteLogo ? <SiteImage src={siteLogo} alt={siteName} fill sizes="32px" className="object-contain p-1" /> : <div className="flex h-full w-full items-center justify-center bg-primary text-sm font-bold text-white">M</div>}
            </Link>
          ) : (
            <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-dark-100 bg-white">
                {siteLogo ? <SiteImage src={siteLogo} alt={siteName} fill sizes="32px" className="object-contain p-1" /> : <div className="flex h-full w-full items-center justify-center bg-primary text-sm font-bold text-white">M</div>}
              </div>
              <div className="min-w-0">
                <span className="block truncate text-sm font-bold text-dark-900">{siteName}</span>
                <span className="block text-[10px] font-medium uppercase tracking-wider text-primary">Administrator</span>
              </div>
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
        <nav className="flex-1 overflow-y-auto px-2.5 py-4 scrollbar-hide" aria-label="Admin navigation">
          {NAV_GROUPS.map((group) => ({ ...group, items: group.items.filter((item) => canSee(item.href)) })).filter((group) => group.items.length > 0).map((group) => (
            <div key={group.label} className="mb-4">
              {!collapsed && (
                <p className="mb-2 px-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-dark-400">
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
                          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/10"
                            : "text-dark-600 hover:bg-dark-50 hover:text-dark hover:translate-x-0.5",
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
      <div className={cn("min-h-screen min-w-0 flex-1 overflow-x-hidden", collapsed ? "lg:pl-[68px]" : "lg:pl-64")}>
        {/* Topbar */}
        <header className={cn("fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-dark-200/80 bg-white/90 px-4 shadow-sm backdrop-blur-xl lg:px-6", collapsed ? "lg:pl-[84px]" : "lg:pl-[280px]")}>
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-dark-500 hover:bg-dark-100 lg:hidden"
              aria-label="Buka menu admin"
            >
              <Menu className="h-5 w-5" />
            </button>
            {/* Branding lives in the header at every breakpoint, including
               phone widths — this is the only branding visible on mobile
               until the sidebar drawer is opened. */}
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dark-100 bg-white shadow-sm">
              {siteLogo ? <SiteImage src={siteLogo} alt={siteName} fill sizes="36px" className="object-contain p-1" /> : <div className="flex h-full w-full items-center justify-center bg-primary text-sm font-bold text-white">{siteName.charAt(0).toUpperCase()}</div>}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-dark">{siteName}</h2>
              <p className="hidden truncate text-[11px] font-medium text-dark-400 sm:block">Administrator • {user.role.replaceAll("_", " ")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-lg px-3 py-1.5 text-xs font-medium text-dark-500 transition-colors hover:bg-dark-100 hover:text-dark">
              Lihat Website
            </Link>
            <div className="flex items-center gap-2 rounded-full border border-dark-100 bg-white py-1 pl-1 pr-2 shadow-sm">
              {user.avatar ? <SiteImage src={user.avatar} alt={user.name} width={32} height={32} className="h-8 w-8 rounded-full object-cover" /> : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{user.name.charAt(0).toUpperCase()}</div>}
              <span className="hidden max-w-28 truncate text-xs font-semibold text-dark-700 sm:block">{user.name}</span>
              <span className="hidden rounded-full bg-dark-50 px-2 py-1 text-[10px] font-semibold capitalize text-dark-500 sm:inline-flex">{user.role.replace("_", " ")}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="min-h-screen overflow-x-hidden px-4 pb-10 pt-20 lg:px-8">
          {canAccessCurrentRoute() ? children : <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center"><div className="rounded-3xl border border-dark-100 bg-white p-8 text-center shadow-sm"><Shield className="mx-auto h-10 w-10 text-primary" /><h1 className="mt-4 text-xl font-bold text-dark">Akses Terbatas</h1><p className="mt-2 text-sm leading-6 text-dark-500">Role <strong>{user.role}</strong> tidak memiliki izin untuk halaman ini.</p><Link href="/admin" className="mt-5 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">Kembali ke Dashboard</Link></div></div>}
        </main>
      </div>
    </div>
  );
}
