import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settings, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, "settings.read")) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } }, { status: 403 });
    }

    const list = await db.select().from(settings);
    const map: Record<string, unknown> = {};
    list.forEach(s => { map[s.key] = s.value; });

    // Merge with env-based status (never expose actual secrets)
    map._integrations = {
      payment: process.env.PAYMENT_PROVIDER || "mock",
      storage: process.env.CLOUDINARY_CLOUD_NAME ? "cloudinary" : "local",
      email: process.env.SMTP_HOST ? "configured" : "not_configured",
      database: "connected",
    };

    return NextResponse.json({ success: true, settings: map });
  } catch {
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal" } }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, "settings.update")) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Akses ditolak" } }, { status: 403 });
    }

    const body = await request.json();
    const entries = Object.entries(body).filter(([k]) => !k.startsWith("_"));

    for (const [key, value] of entries) {
      const existing = await db.select({ id: settings.id }).from(settings).where(eq(settings.key, key)).limit(1);
      if (existing.length > 0) {
        await db.update(settings).set({ value: value as Record<string, unknown>, updatedAt: new Date() }).where(eq(settings.key, key));
      } else {
        await db.insert(settings).values({ key, value: value as Record<string, unknown> });
      }
    }

    await db.insert(auditLogs).values({
      userId: session.userId, action: "SETTINGS_UPDATED", resource: "settings",
      metadata: { keys: Object.keys(body).filter(k => !k.startsWith("_")) },
    });

    return NextResponse.json({ success: true, message: "Pengaturan disimpan" });
  } catch {
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Gagal menyimpan" } }, { status: 500 });
  }
}
