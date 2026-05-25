// src/services/reader.service.ts
import api from "./api";
import type { ReaderPublicDto } from "../types";

const ALL_RELATIONS = "borrowRecords,borrowRecords.book,borrowRecords.book.authors,borrowRecords.book.genres,readingCards";

export const readerService = {
  async findAll(): Promise<ReaderPublicDto[]> {
    const { data } = await api.get<ReaderPublicDto[]>("/readers", {
      params: { relations: ALL_RELATIONS },
    });
    return data;
  },

  async findById(readerId: string): Promise<ReaderPublicDto> {
    const { data } = await api.get<ReaderPublicDto>(`/readers/${readerId}`, {
      params: { relations: ALL_RELATIONS },
    });
    return data;
  },

  async findByUserId(userId: string): Promise<ReaderPublicDto | null> {
    const storedReaderId = localStorage.getItem("readerId");
    if (storedReaderId && storedReaderId !== "null") {  // guard here
      try {
        return await this.findById(storedReaderId);
      } catch {
        // fallback to scan
      }
    }
    const readers = await this.findAll();
    return readers.find(r => r.user?.userId === userId) ?? null;
  },
};