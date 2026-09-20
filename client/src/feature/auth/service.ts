import { api } from "../../lib/axios"
import type { LoginResponse, LoginSchema } from "./type"

export const authService = {
  async login(credentials: LoginSchema): Promise<LoginResponse> {
    return await api.post("/auth/login", credentials) as LoginResponse
  }
}