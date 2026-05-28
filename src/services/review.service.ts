// src/services/review.service.ts
import api from "./api";
import type { ReviewPublicDto } from "../types";

export const reviewService = {
  async create(dto: {
    rating: number;
    comment: string;
    reviewDate: string;
    bookId: string;
    readerId: string;
  }): Promise<string> {
    const { data } = await api.post<string>("/reviews", dto);
    return data;
  },

  async findByBookId(bookId: string): Promise<ReviewPublicDto[]> {
    const { data } = await api.get<ReviewPublicDto[]>("/reviews", {
      params: { relations: "reader,reader.user" },
    });
    return data.filter(r => r.book?.bookId === bookId || !r.book);
  },
};