import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { media, auditLogs } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { getStorageProvider } from "@/lib/media/storage";
import { validateFile, sanitizeFilename } from "@/lib/media/validation";
import type { MediaPurpose, MediaVisibility } from "@/lib/media/types";

export const dynamic = "force-dynamic";

const VALID_PURPOSES: MediaPurpose[] = ["order_asset", "design_revision", "customer_upload", "production_asset", "portfolio", "avatar"];

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Silakan login" } },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const purpose = (formData.get("purpose") as string) || "order_asset";
    const orderId = formData.get("orderId") as string | null;
    const revisionId = formData.get("revisionId") as string | null;
    const visibility = (formData.get("visibility") as string) || "private";

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: "NO_FILE", message: "File wajib diupload" } },
        { status: 400 }
      );
    }

    if (!VALID_PURPOSES.includes(purpose as MediaPurpose)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_PURPOSE", message: "Purpose tidak valid" } },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file.type, file.size, file.name);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_FILE", message: validation.error } },
        { status: 400 }
      );
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = sanitizeFilename(file.name);

    // Upload via storage provider
    const storage = await getStorageProvider();
    const result = await storage.upload(buffer, safeName, file.type, {
      purpose: purpose as MediaPurpose,
      visibility: visibility as MediaVisibility,
      orderId: orderId || undefined,
      revisionId: revisionId || undefined,
    });

    // Create DB record
    const [mediaRecord] = await db
      .insert(media)
      .values({
        userId: session.userId,
        orderId: orderId || null,
        revisionId: revisionId || null,
        filename: result.filename,
        originalFilename: file.name,
        mimeType: file.type,
        size: result.size,
        storageProvider: storage.name,
        storageKey: result.storageKey,
        url: result.url,
        purpose,
        visibility,
        status: "uploaded",
      })
      .returning();

    // Audit
    await db.insert(auditLogs).values({
      userId: session.userId,
      action: "MEDIA_UPLOADED",
      resource: "media",
      resourceId: mediaRecord.id,
      metadata: {
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        purpose,
        orderId,
      },
    });

    return NextResponse.json({
      success: true,
      media: {
        id: mediaRecord.id,
        filename: mediaRecord.originalFilename,
        url: mediaRecord.url,
        size: mediaRecord.size,
        mimeType: mediaRecord.mimeType,
        purpose: mediaRecord.purpose,
      },
    });
  } catch (error) {
    console.error("Media upload error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Gagal mengupload file" } },
      { status: 500 }
    );
  }
}
