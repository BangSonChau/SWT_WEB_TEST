export type Role = "admin" | "user"

export interface AuthState {
  accessToken: string | null;
  role: Role | null;
  // role: string | null;
}

export interface AuthAction {
  setToken: (accessToken: string, role: Role | null) => void;
  // setToken: (accessToken: string, role: string | null) => void;
  clearToken: () => void;
}

export interface LoginSchema {
  email: string,
  password: string,
}

export interface LoginResponse {
  token: string;
  user: {
    role: Role;
  };
}