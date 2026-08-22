/**
 * Centralized permission matrix for Madina Solution RBAC.
 * Every protected API should use checkPermission() instead of
 * inline role arrays.
 */

export type Permission =
  | "dashboard.view"
  | "products.read" | "products.create" | "products.update" | "products.delete"
  | "categories.read" | "categories.create" | "categories.update" | "categories.delete"
  | "orders.read" | "orders.update" | "orders.assign" | "orders.manage"
  | "customers.read" | "customers.update" | "customers.manage"
  | "design.read" | "design.create" | "design.approve"
  | "production.read" | "production.update"
  | "payments.read" | "payments.confirm" | "payments.refund"
  | "content.read" | "content.create" | "content.update" | "content.delete"
  | "media.read" | "media.upload" | "media.delete"
  | "users.read" | "users.update" | "users.manage"
  | "settings.read" | "settings.update"
  | "audit.read";

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  super_admin: [
    "dashboard.view",
    "products.read", "products.create", "products.update", "products.delete",
    "categories.read", "categories.create", "categories.update", "categories.delete",
    "orders.read", "orders.update", "orders.assign", "orders.manage",
    "customers.read", "customers.update", "customers.manage",
    "design.read", "design.create", "design.approve",
    "production.read", "production.update",
    "payments.read", "payments.confirm", "payments.refund",
    "content.read", "content.create", "content.update", "content.delete",
    "media.read", "media.upload", "media.delete",
    "users.read", "users.update", "users.manage",
    "settings.read", "settings.update",
    "audit.read",
  ],
  admin: [
    "dashboard.view",
    "products.read", "products.create", "products.update", "products.delete",
    "categories.read", "categories.create", "categories.update", "categories.delete",
    "orders.read", "orders.update", "orders.assign", "orders.manage",
    "customers.read", "customers.update", "customers.manage",
    "design.read", "design.create", "design.approve",
    "production.read", "production.update",
    "payments.read", "payments.confirm", "payments.refund",
    "content.read", "content.create", "content.update", "content.delete",
    "media.read", "media.upload", "media.delete",
    "users.read", "users.update",
    "settings.read", "settings.update",
    "audit.read",
  ],
  manager: [
    "dashboard.view",
    "products.read", "products.create", "products.update",
    "categories.read", "categories.create", "categories.update",
    "orders.read", "orders.update", "orders.assign", "orders.manage",
    "customers.read", "customers.update",
    "design.read", "design.create", "design.approve",
    "production.read", "production.update",
    "payments.read", "payments.confirm",
    "content.read", "content.create", "content.update",
    "media.read", "media.upload",
    "users.read",
    "audit.read",
  ],
  staff: [
    "dashboard.view",
    "products.read",
    "categories.read",
    "orders.read", "orders.update",
    "customers.read",
    "design.read",
    "production.read",
    "payments.read",
    "content.read",
    "media.read",
  ],
  designer: [
    "dashboard.view",
    "orders.read",
    "design.read", "design.create",
    "media.read", "media.upload",
  ],
  production: [
    "dashboard.view",
    "orders.read",
    "production.read", "production.update",
    "media.read",
  ],
  customer: [
    "dashboard.view",
  ],
};

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: string, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return perms.includes(permission);
}

/**
 * Check if a role has ANY of the given permissions.
 */
export function hasAnyPermission(role: string, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Get all permissions for a role.
 */
export function getPermissions(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Role hierarchy for escalation prevention.
 * A user can only assign roles with lower or equal rank.
 */
const ROLE_HIERARCHY: Record<string, number> = {
  super_admin: 100,
  admin: 90,
  manager: 70,
  staff: 50,
  designer: 40,
  production: 40,
  customer: 10,
};

/**
 * Check if actor can assign target role (prevent escalation).
 */
export function canAssignRole(actorRole: string, targetRole: string): boolean {
  const actorRank = ROLE_HIERARCHY[actorRole] ?? 0;
  const targetRank = ROLE_HIERARCHY[targetRole] ?? 0;
  return actorRank > targetRank;
}
