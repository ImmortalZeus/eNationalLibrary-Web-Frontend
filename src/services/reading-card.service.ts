// src/services/reading-card.service.ts
import api from "./api";
import type {
  ReadingCardPublicDto,
  CreateReadingCardInput,
  UpdateReadingCardInput,
} from "../types";

export const readingCardService = {
  async create(dto: CreateReadingCardInput): Promise<string> {
    const { data } = await api.post<string>("/reading-cards", dto);
    return data;
  },

  async findAll(): Promise<ReadingCardPublicDto[]> {
    const { data } = await api.get<ReadingCardPublicDto[]>("/reading-cards", {
      params: { relations: "reader,reader.user" },
    });
    return data;
  },

  /** PUT /reading-cards/:id - backend ignores readerId on update */
  async update(id: string, dto: UpdateReadingCardInput): Promise<boolean> {
    const { data } = await api.put<boolean>(`/reading-cards/${id}`, dto);
    return data;
  },

  /** DELETE /reading-cards/:id */
  async remove(id: string): Promise<boolean> {
    const { data } = await api.delete<boolean>(`/reading-cards/${id}`);
    return data;
  },
};
