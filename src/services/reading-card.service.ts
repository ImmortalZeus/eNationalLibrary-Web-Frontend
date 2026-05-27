// src/services/reading-card.service.ts
import api from "./api";
import type { ReadingCardPublicDto } from "../types";

export const readingCardService = {
  async create(dto: {
    label: string;
    type: "Normal" | "VIP";
    activationDate: string;
    expiryDate: string;
    readerId: string;
  }): Promise<string> {
    const { data } = await api.post<string>("/reading-cards", dto);
    return data;
  },

  async update(cardId: string, dto: {
    label?: string;
    type?: "Normal" | "VIP";
    activationDate?: string;
    expiryDate?: string;
  }): Promise<boolean> {
    const { data } = await api.put<boolean>(`/reading-cards/${cardId}`, dto);
    return data;
  },

  async findAll(): Promise<ReadingCardPublicDto[]> {
    const { data } = await api.get<ReadingCardPublicDto[]>("/reading-cards", {
      params: { relations: "reader" },
    });
    return data;
  },
};