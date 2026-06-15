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
  dateOfBirth?: string | null;   // ISO date; used for age-based promotions
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
  reviews?: ReviewPublicDto[];
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
  // Pricing / promotion (populated by the backend when a card is created)
  appliedPromotion?: PromotionPublicDto | null;
  originalPrice?: number;
  discountedPrice?: number;
  effectiveMaxBorrowedBooks?: number;
  effectiveMaxBorrowDurationDays?: number;
}

export interface ReaderPublicDto {
  userId: string;
  address: string | null;
  user?: User;
  borrowRecords?: BorrowRecordPublicDto[];
  waitingBooks?: BookPublicDto[];
  readingCards?: ReadingCardPublicDto[];  // add this line
}

// ─── Admin console: public DTOs ───────────────────────────────────────────────
// (Interface-merged addition: backend Publisher also returns a description)
export interface PublisherPublicDto {
  description?: string;
}

export interface ReviewPublicDto {
  reviewId: string;
  rating: number;
  comment: string;
  reviewDate: string;
  book?: BookPublicDto;
  reader?: ReaderPublicDto;
}

export interface AdminPublicDto {
  userId: string;          // this is the admin's userId
  user?: User;
}

// ─── Admin console: create / update payloads (mirror backend Create*/Update* DTOs) ─
export interface UserInput {
  username: string;
  gender: UserGender;
  email: string;
  password: string;
  phoneNumber?: string | null;
  role: UserRole;
  status: UserStatus;
}
export type UpdateUserInput = Partial<UserInput>;

export interface CreateAuthorInput {
  name: string;
  dateOfBirth?: string;            // "YYYY-MM-DD"
  dateOfDeath?: string | null;
  description?: string;
}
export type UpdateAuthorInput = Partial<CreateAuthorInput>;

export interface CreateGenreInput {
  label: string;
  description: string;
}
export type UpdateGenreInput = Partial<CreateGenreInput>;

export interface CreatePublisherInput {
  name: string;
  description: string;
}
export type UpdatePublisherInput = Partial<CreatePublisherInput>;

export interface CreateBookInput {
  title: string;
  description: string;
  previewUrl: string;
  authorIds?: string[];
  publisherIds?: string[];
  genreIds?: string[];
}
export type UpdateBookInput = Partial<CreateBookInput>;

export interface CreateReaderInput {
  address?: string | null;
  user: UserInput;
}
export interface UpdateReaderInput {
  address?: string | null;
  user?: UpdateUserInput;
}

export interface CreateAdminInput {
  user: UserInput;
}
export interface UpdateAdminInput {
  user?: UpdateUserInput;
}

export interface CreateReadingCardInput {
  label: string;
  type: ReadingCardType;
  activationDate: string;          // "YYYY-MM-DD"
  expiryDate?: string | null;
  readerId?: string;
}
// backend strips readerId on update
export type UpdateReadingCardInput = Partial<Omit<CreateReadingCardInput, "readerId">>;

export interface CreateReviewInput {
  rating: number;                  // 1..5
  comment: string;
  reviewDate: string;              // "YYYY-MM-DD"
  bookId?: string;
  readerId?: string;
}
export type UpdateReviewInput = Partial<CreateReviewInput>;

// backend strips readerId & bookId on update
export interface UpdateBorrowRecordInput {
  quantity?: number;
  borrowDate?: string;
  dueDate?: string;
  actualReturnDate?: string | null;
}

// ─── Promotions (mirror backend promotion module) ─────────────────────────────
export type DiscountType = "Percentage" | "FixedAmount";

export interface PromotionPublicDto {
  promotionId: string;
  name: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  maxBorrowedBooksOverride: number | null;
  maxBorrowDurationOverride: number | null;
  applicableCardTypes: ReadingCardType[];
  applicableAgeMin: number;
  applicableAgeMax: number;
  startDate: string;            // ISO date
  endDate: string;              // ISO date
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

/** POST /promotions body. isActive & priority are managed by the backend (not set here). */
export interface CreatePromotionInput {
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;                 // >= 0
  maxBorrowedBooksOverride?: number;     // >= 1 if provided
  maxBorrowDurationOverride?: number;    // >= 1 if provided
  applicableCardTypes: ReadingCardType[];
  applicableAgeMin: number;              // >= 0
  applicableAgeMax: number;              // >= 0
  startDate: string;                     // "YYYY-MM-DD"
  endDate: string;                       // "YYYY-MM-DD"
}
export type UpdatePromotionInput = Partial<CreatePromotionInput>;