import type { Role } from "./types";

export const MANAGER_ROLES: Role[] = ["Manager IT", "Assistant Manager IT"];

export const isManager = (role?: Role | null): boolean =>
  !!role && MANAGER_ROLES.includes(role);

const MANAGER_ONLY_PATHS = [
  "/users",
  "/departments",
  "/roles",
  "/audit-logs",
  "/assets",
  "/projects",
  "/infrastructure",
  "/knowledge-base",
  "/reports",
];

export function canAccessPath(role: Role | undefined | null, pathname: string): boolean {
  if (isManager(role)) return true;
  return !MANAGER_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}