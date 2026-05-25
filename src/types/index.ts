// src/types/index.ts

import type React from "react";

// ─── Enums (mirror backend) ───────────────────────────────────────────────────
export type UserRole   = "Admin"    | "Reader";
export type UserGender = "Male"     | "Female";
export type UserStatus = "Active"   | "Inactive";
export type ReadingCardType = "Normal" | "VIP";
// ─── Auth ─────────────────────────────────────────────────────────────────────

/** POST /auth/login  →  body */
export interface LoginDto {
  usernameOrEmail: string;
  password: string;
}

/** POST /auth/login  →  response */
export interface LoginResponse {
  accessToken: string;
}

/** Decoded JWT payload (sub = userId) */
export interface JwtPayload {
  sub: string;       // userId (uuid)
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ─── User ─────────────────────────────────────────────────────────────────────

/** POST /users  →  body  (maps to CreateUserDto) */
export interface RegisterDto {
  username: string;
  gender: UserGender;
  email: string;
  password: string;
  phoneNumber?: string | null;
  role: UserRole;
  status: UserStatus;
}

/** User shape returned from the backend (user-public.dto) */
export interface User {
  userId: string;
  username: string;
  gender: UserGender;
  email: string;
  phoneNumber: string | null;
  role: UserRole;
  status: UserStatus;
}

// ─── Book ─────────────────────────────────────────────────────────────────────
export interface Book {
  id: number;
  title: string;
  author: string;         // will come from Author relation
  genre: string;          // will come from Genre relation
  status: "Available" | "Borrowed";
}

// ─── UI helpers (non-backend) ─────────────────────────────────────────────────
export interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}


export interface AuthorPublicDto {
  authorId: string;
  name: string;
  dateOfBirth: string;
  dateOfDeath: string | null;
  description: string;
}

export interface GenrePublicDto {
  genreId: string;
  label: string;
  description: string;
}

export interface PublisherPublicDto {
  publisherId: string;
  name: string;
}

export interface BookPublicDto {
  bookId: string;
  title: string;
  description: string;
  previewUrl: string;
  authors?: AuthorPublicDto[];
  publishers?: PublisherPublicDto[];
  genres?: GenrePublicDto[];
}

export interface BorrowRecordPublicDto {
  borrowRecordId: string;
  quantity: number;
  borrowDate: string;
  dueDate: string;
  actualReturnDate: string | null;
  reader?: ReaderPublicDto;
  book?: BookPublicDto;
}

export interface ReaderPublicDto {
  userId: string;          // this is the readerId
  address: string | null;
  user?: User;
  borrowRecords?: BorrowRecordPublicDto[];
  waitingBooks?: BookPublicDto[];
}

export interface CreateBorrowRecordDto {
  quantity: number;
  borrowDate: string;   // ISO date string "YYYY-MM-DD"
  dueDate: string;
  actualReturnDate?: string | null;
  readerId?: string;
  bookId?: string;
}

export interface ReadingCardPublicDto {
  readingCardId: string;
  label: string;
  type: ReadingCardType;
  activationDate: string;
  expiryDate: string | null;
  reader?: ReaderPublicDto;
}

export interface ReaderPublicDto {
  userId: string;
  address: string | null;
  user?: User;
  borrowRecords?: BorrowRecordPublicDto[];
  waitingBooks?: BookPublicDto[];
  readingCards?: ReadingCardPublicDto[];  // add this line
}