import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({
      status: "ok",
      version: "0.10.0",
      database: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      { status: "error", version: "0.10.0", database: "error" },
      { status: 500 }
    );
  }
}
