// src/services/auth.service.ts
import api from "./api";
import type { LoginDto, LoginResponse, RegisterDto, ReaderPublicDto } from "../types";

export const authService = {
  /** POST /auth/login */
  async login(dto: LoginDto): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/login", dto);
    return data;
  },

  /** POST /readers — creates user + reader in one call */
async register(dto: RegisterDto): Promise<string> {
  const { data } = await api.post<string>("/readers", {
      address: null,
      user: {
        username:    dto.username,
        email:       dto.email,
        password:    dto.password,
        gender:      dto.gender,
        phoneNumber: dto.phoneNumber ?? null,
        role:        "Reader",
        status:      "Active",
      },
    });
    return data;
  },
};