import type { Book } from "../types";

export const PALETTE = {
  slateGrey:   "#545F66",
  burntOrange: "#BD632F",
  blushCream:  "#F7EBE8",
  mintTeal:    "#63E2C6",
  darkNavy:    "#404E5C",
} as const;

export const GENRE_COLORS: Record<string, string> = {
  Fiction:    PALETTE.burntOrange,
  Technology: PALETTE.darkNavy,
  Art:        PALETTE.slateGrey,
  Philosophy: PALETTE.mintTeal,
};

export const FEATURED_BOOKS: Book[] = [
  { id: 1, title: "The Great Adventure", author: "John Smith",   genre: "Fiction",     status: "Available" },
  { id: 2, title: "Learning JavaScript",  author: "Jane Doe",    genre: "Technology",  status: "Available" },
  { id: 3, title: "History of Art",       author: "Alice Brown", genre: "Art",         status: "Borrowed"  },
  { id: 4, title: "Modern Philosophy",    author: "Bob Wilson",  genre: "Philosophy",  status: "Available" },
];