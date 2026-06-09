// src/services/author.service.ts
import api from "./api";
import type {
  AuthorPublicDto,
  CreateAuthorInput,
  UpdateAuthorInput,
} from "../types";

export const authorService = {
  async findAll(): Promise<AuthorPublicDto[]> {
    const { data } = await api.get<AuthorPublicDto[]>("/authors");
    return data;
  },

  async findById(id: string): Promise<AuthorPublicDto> {
    const { data } = await api.get<AuthorPublicDto>(`/authors/${id}`);
    return data;
  },

  /** POST /authors — returns new authorId */
  async create(dto: CreateAuthorInput): Promise<string> {
    const { data } = await api.post<string>("/authors", dto);
    return data;
  },

  async update(id: string, dto: UpdateAuthorInput): Promise<boolean> {
    const { data } = await api.put<boolean>(`/authors/${id}`, dto);
    return data;
  },

  async remove(id: string): Promise<boolean> {
    const { data } = await api.delete<boolean>(`/authors/${id}`);
    return data;
  },
};
