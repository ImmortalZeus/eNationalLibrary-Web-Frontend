// src/services/publisher.service.ts
import api from "./api";
import type {
  PublisherPublicDto,
  CreatePublisherInput,
  UpdatePublisherInput,
} from "../types";

export const publisherService = {
  async findAll(): Promise<PublisherPublicDto[]> {
    const { data } = await api.get<PublisherPublicDto[]>("/publishers");
    return data;
  },

  async findById(id: string): Promise<PublisherPublicDto> {
    const { data } = await api.get<PublisherPublicDto>(`/publishers/${id}`);
    return data;
  },

  /** POST /publishers — returns new publisherId */
  async create(dto: CreatePublisherInput): Promise<string> {
    const { data } = await api.post<string>("/publishers", dto);
    return data;
  },

  async update(id: string, dto: UpdatePublisherInput): Promise<boolean> {
    const { data } = await api.put<boolean>(`/publishers/${id}`, dto);
    return data;
  },

  async remove(id: string): Promise<boolean> {
    const { data } = await api.delete<boolean>(`/publishers/${id}`);
    return data;
  },
};
