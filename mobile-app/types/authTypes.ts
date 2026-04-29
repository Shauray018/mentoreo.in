export type UserRole = "student" | "mentor";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};
