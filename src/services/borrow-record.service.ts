// src/services/borrow-record.service.ts
import api from "./api";
import type { CreateBorrowRecordDto, BorrowRecordPublicDto } from "../types";

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
};