export type UserRole = "user" | "admin";

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
