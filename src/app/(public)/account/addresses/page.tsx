"use client";

import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-provider";

export default function AddressesPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-dark">Alamat Saya</h2>
      <p className="mt-1 text-dark-500">Kelola alamat pengiriman Anda</p>

      <Card className="mt-6">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-dark-50">
            <MapPin className="h-8 w-8 text-dark-300" />
          </div>
          <h3 className="mt-4 font-semibold text-dark">Belum Ada Alamat</h3>
          <p className="mt-1 text-sm text-dark-500">
            Tambahkan alamat pengiriman untuk checkout yang lebih cepat.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
