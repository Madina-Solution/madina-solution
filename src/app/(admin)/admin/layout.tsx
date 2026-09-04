import type { Metadata } from "next";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasAnyPermission } from "@/lib/auth/permissions";
import { AdminShell } from "./admin-shell";
import { getPublicSiteConfig } from "@/lib/site-config";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || !hasAnyPermission(session.role, ["admin.access"])) {
    redirect("/login");
  }
  const site = await getPublicSiteConfig();
  return <AdminShell siteName={site.siteName} siteLogo={site.siteLogo}>{children}</AdminShell>;
}
