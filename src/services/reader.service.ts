// src/services/reader.service.ts
import api from "./api";
import type {
  ReaderPublicDto,
  CreateReaderInput,
  UpdateReaderInput,
} from "../types";

const ALL_RELATIONS = "borrowRecords,borrowRecords.book,borrowRecords.book.authors,borrowRecords.book.genres,readingCards";

export const readerService = {
  async findAll(): Promise<ReaderPublicDto[]> {
    const { data } = await api.get<ReaderPublicDto[]>("/readers", {
      params: { relations: ALL_RELATIONS },
    });
    return data;
  },

  /** Lightweight list for admin tables - only the user relation. */
  async findAllWithUser(): Promise<ReaderPublicDto[]> {
    const { data } = await api.get<ReaderPublicDto[]>("/readers", {
      params: { relations: "user" },
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
    if (storedReaderId && storedReaderId !== "null") {
      try {
        return await this.findById(storedReaderId);
      } catch {
        // fallback to scan
      }
    }
    const readers = await this.findAll();
    return readers.find(r => r.user?.userId === userId) ?? null;
  },

  /** POST /readers - creates user + reader, returns new readerId (userId) */
  async create(dto: CreateReaderInput): Promise<string> {
    const { data } = await api.post<string>("/readers", dto);
    return data;
  },

  /** PUT /readers/:id */
  async update(readerId: string, dto: UpdateReaderInput): Promise<boolean> {
    const { data } = await api.put<boolean>(`/readers/${readerId}`, dto);
    return data;
  },

  /** DELETE /readers/:id */
  async remove(readerId: string): Promise<boolean> {
    const { data } = await api.delete<boolean>(`/readers/${readerId}`);
    return data;
  },
};
