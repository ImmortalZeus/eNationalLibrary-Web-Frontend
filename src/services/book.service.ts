// src/services/book.service.ts
import api from "./api";
import type { BookPublicDto, CreateBookInput, UpdateBookInput } from "../types";

export const bookService = {
  async findAll(): Promise<BookPublicDto[]> {
    const { data } = await api.get<BookPublicDto[]>("/books", {
      params: { relations: "authors,genres,publishers" },
    });
    return data;
  },

  async findById(bookId: string): Promise<BookPublicDto> {
    const { data } = await api.get<BookPublicDto>(`/books/${bookId}`, {
      params: { relations: "authors,genres,publishers" },
    });
    return data;
  },

  /** POST /books - returns new bookId */
  async create(dto: CreateBookInput): Promise<string> {
    const { data } = await api.post<string>("/books", dto);
    return data;
  },

  /** PUT /books/:id */
  async update(bookId: string, dto: UpdateBookInput): Promise<boolean> {
    const { data } = await api.put<boolean>(`/books/${bookId}`, dto);
    return data;
  },

  /** DELETE /books/:id */
  async remove(bookId: string): Promise<boolean> {
    const { data } = await api.delete<boolean>(`/books/${bookId}`);
    return data;
  },
};
