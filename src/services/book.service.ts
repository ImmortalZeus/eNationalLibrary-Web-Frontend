// src/services/book.service.ts
import api from "./api";
import type { BookPublicDto } from "../types";

export const bookService = {
  async findAll(): Promise<BookPublicDto[]> {
    const { data } = await api.get<BookPublicDto[]>("/books", {
      params: { relations: "authors,genres,publishers" },
    });
    return data;
  },

  async findById(bookId: string): Promise<BookPublicDto> {
    const { data } = await api.get<BookPublicDto>(`/books/${bookId}`, {
      params: { relations: "authors,genres,publishers,reviews,reviews.reader,reviews.reader.user" },
    });
    return data;
  },
};