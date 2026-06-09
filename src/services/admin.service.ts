// src/services/admin.service.ts
import api from "./api";
import type {
  AdminPublicDto,
  CreateAdminInput,
  UpdateAdminInput,
} from "../types";

export const adminService = {
  async findAll(): Promise<AdminPublicDto[]> {
    const { data } = await api.get<AdminPublicDto[]>("/admins", {
      params: { relations: "user" },
    });
    return data;
  },

  async findById(id: string): Promise<AdminPublicDto> {
    const { data } = await api.get<AdminPublicDto>(`/admins/${id}`, {
      params: { relations: "user" },
    });
    return data;
  },

  /** POST /admins — returns new admin userId */
  async create(dto: CreateAdminInput): Promise<string> {
    const { data } = await api.post<string>("/admins", dto);
    return data;
  },

  async update(id: string, dto: UpdateAdminInput): Promise<boolean> {
    const { data } = await api.put<boolean>(`/admins/${id}`, dto);
    return data;
  },

  async remove(id: string): Promise<boolean> {
    const { data } = await api.delete<boolean>(`/admins/${id}`);
    return data;
  },
};
