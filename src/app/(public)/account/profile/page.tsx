"use client";

import { useAuth } from "@/lib/auth/auth-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-dark">Profil Saya</h2>
      <p className="mt-1 text-dark-500">Kelola informasi profil Anda</p>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-dark">{user.name}</h3>
              <p className="text-dark-500">{user.email}</p>
              <Badge className="mt-1" variant="secondary">
                {user.role === "customer" ? "Pelanggan" : user.role}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
