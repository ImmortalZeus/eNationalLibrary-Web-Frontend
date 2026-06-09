// src/services/borrow-record.service.ts
import api from "./api";
import type {
  CreateBorrowRecordDto,
  BorrowRecordPublicDto,
  UpdateBorrowRecordInput,
} from "../types";

export const borrowRecordService = {
  async create(dto: CreateBorrowRecordDto): Promise<string> {
    const { data } = await api.post<string>("/borrow-records", dto);
    return data; // returns borrowRecordId
  },

  async findAll(): Promise<BorrowRecordPublicDto[]> {
    const { data } = await api.get<BorrowRecordPublicDto[]>("/borrow-records", {
      params: { relations: "book,reader,reader.user" },
    });
    return data;
  },

  /** PUT /borrow-records/:id - backend ignores readerId/bookId on update */
  async update(id: string, dto: UpdateBorrowRecordInput): Promise<boolean> {
    const { data } = await api.put<boolean>(`/borrow-records/${id}`, dto);
    return data;
  },

  /** DELETE /borrow-records/:id */
  async remove(id: string): Promise<boolean> {
    const { data } = await api.delete<boolean>(`/borrow-records/${id}`);
    return data;
  },
};
