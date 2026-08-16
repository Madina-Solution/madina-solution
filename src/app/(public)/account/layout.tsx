"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  UserCircle,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-provider";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const NAV_ITEMS = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "Pesanan", icon: Package, exact: false },
  { href: "/account/favorites", label: "Favorit", icon: Heart, exact: false },
  { href: "/account/addresses", label: "Alamat", icon: MapPin, exact: false },
  { href: "/account/profile", label: "Profil", icon: UserCircle, exact: false },
  { href: "/account/settings", label: "Pengaturan", icon: Settings, exact: false },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { toast } = useToast();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  const handleLogout = async () => {
    await logout();
    toast({ type: "success", title: "Berhasil keluar" });
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <Skeleton className="h-10 w-60" />
          <div className="mt-8 grid gap-8 lg:grid-cols-4">
            <Skeleton className="h-96" />
            <div className="lg:col-span-3"><Skeleton className="h-96" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dark lg:text-3xl">
            Halo, {user.name}
          </h1>
          <p className="mt-1 text-dark-500">{user.email}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <nav
            className="hidden lg:block"
            aria-label="Account navigation"
          >
            <div className="sticky top-24 rounded-2xl border border-dark-100 bg-white p-4">
              <ul className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-dark-600 hover:bg-dark-50 hover:text-dark"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
                <li className="pt-2 border-t border-dark-100 mt-2">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </button>
                </li>
              </ul>
            </div>
          </nav>

          {/* Mobile Nav */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide lg:hidden">
            {NAV_ITEMS.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "bg-dark-100 text-dark-600 hover:bg-dark-200"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Content */}
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
