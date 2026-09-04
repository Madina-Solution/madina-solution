import { cache } from "react";
import { db } from "@/db";
import { navigationItems } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import {
  QUICK_NAV_SERVICES,
  QUICK_NAV_PRODUCTS,
  QUICK_NAV_EXPLORE,
  type QuickNavItem,
  type QuickNavIcon,
} from "@/lib/navigation";

export type PublicNavigation = {
  services: QuickNavItem[];
  products: QuickNavItem[];
  explore: QuickNavItem[];
};

const STATIC_FALLBACK: PublicNavigation = {
  services: QUICK_NAV_SERVICES,
  products: QUICK_NAV_PRODUCTS,
  explore: QUICK_NAV_EXPLORE,
};

/**
 * Loads the admin-managed Mega Menu / Mobile Nav items from `navigation_items`.
 * Falls back to the static QUICK_NAV_* baseline (src/lib/navigation.ts) when:
 *  - the table is empty (shouldn't normally happen — ensure-db-schema.mjs
 *    seeds it once on first migrate), or
 *  - the query fails, e.g. on an environment where `db:migrate` hasn't run
 *    yet and the table/enum don't exist.
 * This keeps the public site rendering correctly even mid-deploy.
 */
export const getPublicNavigation = cache(async function getPublicNavigation(): Promise<PublicNavigation> {
  try {
    const rows = await db
      .select()
      .from(navigationItems)
      .where(eq(navigationItems.isActive, true))
      .orderBy(asc(navigationItems.group), asc(navigationItems.sortOrder));

    if (rows.length === 0) return STATIC_FALLBACK;

    const toItem = (row: (typeof rows)[number]): QuickNavItem => ({
      name: row.name,
      href: row.href,
      icon: row.icon as QuickNavIcon,
      description: row.description ?? undefined,
    });

    return {
      services: rows.filter((r) => r.group === "services").map(toItem),
      products: rows.filter((r) => r.group === "products").map(toItem),
      explore: rows.filter((r) => r.group === "explore").map(toItem),
    };
  } catch {
    return STATIC_FALLBACK;
  }
});

// Re-exported for the /api/navigation route and any other consumer that
// needs a single active group instead of the full grouped payload.
export async function getPublicNavigationGroup(group: "services" | "products" | "explore"): Promise<QuickNavItem[]> {
  try {
    const rows = await db
      .select()
      .from(navigationItems)
      .where(and(eq(navigationItems.isActive, true), eq(navigationItems.group, group)))
      .orderBy(asc(navigationItems.sortOrder));
    if (rows.length === 0) return STATIC_FALLBACK[group];
    return rows.map((row) => ({ name: row.name, href: row.href, icon: row.icon as QuickNavIcon, description: row.description ?? undefined }));
  } catch {
    return STATIC_FALLBACK[group];
  }
}
