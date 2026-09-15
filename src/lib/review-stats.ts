import { sql } from "drizzle-orm";
import { reviews } from "@/db/schema";

/** Approved review stats derived from the authoritative reviews table. */
export function approvedReviewCount(productId: unknown) {
  return sql<number>`(
    SELECT count(*)::int
    FROM ${reviews} AS review_stats
    WHERE review_stats.product_id = ${productId}
      AND review_stats.is_approved = true
  )`;
}

export function approvedReviewAverage(productId: unknown) {
  return sql<string>`(
    SELECT COALESCE(ROUND(AVG(review_stats.rating)::numeric, 1), 0)::text
    FROM ${reviews} AS review_stats
    WHERE review_stats.product_id = ${productId}
      AND review_stats.is_approved = true
  )`;
}
