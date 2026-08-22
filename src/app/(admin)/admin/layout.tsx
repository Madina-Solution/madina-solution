import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasAnyPermission } from "@/lib/auth/permissions";
import { AdminShell } from "./admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || !hasAnyPermission(session.role, ["dashboard.view"])) {
    redirect("/login");
  }
  return <AdminShell>{children}</AdminShell>;
}
