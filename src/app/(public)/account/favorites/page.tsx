"use client";

import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-provider";

export default function FavoritesPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-dark">Favorit</h2>
      <p className="mt-1 text-dark-500">Produk dan layanan yang Anda simpan</p>

      <Card className="mt-6">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-dark-50">
            <Heart className="h-8 w-8 text-dark-300" />
          </div>
          <h3 className="mt-4 font-semibold text-dark">Belum Ada Favorit</h3>
          <p className="mt-1 text-sm text-dark-500">
            Simpan produk favorit Anda untuk akses cepat.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/products">Jelajahi Produk</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
