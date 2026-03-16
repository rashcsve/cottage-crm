import { UserRole } from "../types/profile";

export function isAdminRole(role: UserRole): boolean {
  return role === "admin";
}
