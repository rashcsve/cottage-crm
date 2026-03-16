export type UserRole = "admin" | "viewer";

export interface Profile {
  id: string;
  display_name: string;
  role: UserRole;
}
