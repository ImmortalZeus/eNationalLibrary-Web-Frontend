// src/services/auth.service.ts
import api from "./api";
import type { LoginDto, LoginResponse, RegisterDto, User } from "../types";

export const authService = {
  /** POST /auth/login */
  async login(dto: LoginDto): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/login", dto);
    return data;
  },

  /** POST /users  — registers a new Reader account */
  async register(dto: RegisterDto): Promise<User> {
  console.log("Sending to backend:", JSON.stringify(dto, null, 2));
  const { data } = await api.post<User>("/users", dto);
  return data;
},
};