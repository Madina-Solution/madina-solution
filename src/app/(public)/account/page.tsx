"use client";

import Link from "next/link";
import {
  Package,
  Clock,
  CheckCircle2,
  CreditCard,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-provider";

export default function AccountPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-dark-500">Total Pesanan</p>
              <p className="text-2xl font-bold text-dark">0</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-dark-500">Dalam Proses</p>
              <p className="text-2xl font-bold text-dark">0</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-dark-500">Selesai</p>
              <p className="text-2xl font-bold text-dark">0</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-dark-500">Menunggu Bayar</p>
              <p className="text-2xl font-bold text-dark">0</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-dark">Pesanan Terbaru</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/account/orders">
                Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-6 flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-dark-50">
              <ShoppingBag className="h-8 w-8 text-dark-300" />
            </div>
            <h3 className="mt-4 font-semibold text-dark">Belum Ada Pesanan</h3>
            <p className="mt-1 text-sm text-dark-500">
              Temukan produk dan layanan untuk kebutuhan bisnis Anda.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/products">Jelajahi Produk</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-dark">Aksi Cepat</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              href="/products"
              className="flex items-center gap-3 rounded-xl border border-dark-100 p-4 transition-colors hover:border-primary/20 hover:bg-primary/5"
            >
              <ShoppingBag className="h-5 w-5 text-primary" />
              <span className="font-medium text-dark">Buat Pesanan Baru</span>
            </Link>
            <Link
              href="/account/profile"
              className="flex items-center gap-3 rounded-xl border border-dark-100 p-4 transition-colors hover:border-primary/20 hover:bg-primary/5"
            >
              <Package className="h-5 w-5 text-primary" />
              <span className="font-medium text-dark">Lengkapi Profil</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
