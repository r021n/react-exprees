import { UserRole } from "../entities/User";

export interface AuthUserPayload {
  id: number;
  email: string;
  role: UserRole;
}
