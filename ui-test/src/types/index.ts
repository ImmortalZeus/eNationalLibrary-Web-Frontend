export interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  status: "Available" | "Borrowed";
}

export interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}