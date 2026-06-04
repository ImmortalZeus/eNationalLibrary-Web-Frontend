// src/services/review.service.ts
// NOTE: the backend ReviewController is protected by JwtAuthGuard, so these
// calls require a logged-in admin token (attached automatically by api.ts).
import api from "./api";
import type {
  ReviewPublicDto,
  CreateReviewInput,
  UpdateReviewInput,
} from "../types";

export const reviewService = {
  async findAll(): Promise<ReviewPublicDto[]> {
    const { data } = await api.get<ReviewPublicDto[]>("/reviews", {
      params: { relations: "book,reader,reader.user" },
    });
    return data;
  },

  async findById(id: string): Promise<ReviewPublicDto> {
    const { data } = await api.get<ReviewPublicDto>(`/reviews/${id}`, {
      params: { relations: "book,reader,reader.user" },
    });
    return data;
  },

  /** POST /reviews — returns new reviewId */
  async create(dto: CreateReviewInput): Promise<string> {
    const { data } = await api.post<string>("/reviews", dto);
    return data;
  },

  async update(id: string, dto: UpdateReviewInput): Promise<boolean> {
    const { data } = await api.put<boolean>(`/reviews/${id}`, dto);
    return data;
  },

  async remove(id: string): Promise<boolean> {
    const { data } = await api.delete<boolean>(`/reviews/${id}`);
    return data;
  },
};
