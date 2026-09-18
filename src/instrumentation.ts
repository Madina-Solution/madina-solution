import type { Instrumentation } from "next";

function safeHeaders(headers: Record<string, string | string[] | undefined>) {
  const allowed = ["host", "user-agent", "x-forwarded-for", "x-vercel-id"];
  return Object.fromEntries(Object.entries(headers).filter(([key]) => allowed.includes(key.toLowerCase())));
}

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const normalizedError = error instanceof Error ? error : new Error(String(error));
  const digest = typeof error === "object" && error !== null && "digest" in error ? String((error as { digest?: unknown }).digest ?? "") : undefined;
  const payload = {
    message: normalizedError.message,
    digest,
    request: { path: request.path, method: request.method, headers: safeHeaders(request.headers) },
    context,
    timestamp: new Date().toISOString(),
  };

  // Always structured-log so Vercel/host observability can ingest server errors.
  console.error("[madina.request-error]", JSON.stringify(payload));

  const webhook = process.env.ERROR_MONITORING_WEBHOOK_URL?.trim();
  if (!webhook) return;

  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    // Monitoring must never break a user request.
  }
};
