"use client";

import { useAuth } from "@/lib/auth/auth-provider";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-dark">Pengaturan</h2>
      <p className="mt-1 text-dark-500">Kelola pengaturan akun Anda</p>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-semibold text-dark">Pengaturan Notifikasi</h3>
          <p className="mt-2 text-sm text-dark-500">
            Pengaturan notifikasi akan tersedia setelah fitur notifikasi diaktifkan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
