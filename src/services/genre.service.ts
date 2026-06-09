// src/services/genre.service.ts
import api from "./api";
import type {
  GenrePublicDto,
  CreateGenreInput,
  UpdateGenreInput,
} from "../types";

export const genreService = {
  async findAll(): Promise<GenrePublicDto[]> {
    const { data } = await api.get<GenrePublicDto[]>("/genres");
    return data;
  },

  async findById(id: string): Promise<GenrePublicDto> {
    const { data } = await api.get<GenrePublicDto>(`/genres/${id}`);
    return data;
  },

  /** POST /genres — returns new genreId */
  async create(dto: CreateGenreInput): Promise<string> {
    const { data } = await api.post<string>("/genres", dto);
    return data;
  },

  async update(id: string, dto: UpdateGenreInput): Promise<boolean> {
    const { data } = await api.put<boolean>(`/genres/${id}`, dto);
    return data;
  },

  async remove(id: string): Promise<boolean> {
    const { data } = await api.delete<boolean>(`/genres/${id}`);
    return data;
  },
};
