import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/lib/payment/service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const service = new PaymentService();
    const { processed } = await service.processWebhook(request);

    // Always return 200 to provider — even for already-processed events
    return NextResponse.json({ success: true, processed });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Return 200 to prevent provider retry storms for bad data
    // Log the error for internal investigation
    return NextResponse.json({ success: false, error: "Processing failed" }, { status: 200 });
  }
}
