export type BookStatus = "want-to-read" | "reading" | "completed";

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  category?: string;
  status: BookStatus;
  progress: number; // 0-100
  coverUrl: string;
  totalPages?: number;
  currentPage?: number;
  rating?: number; // 1-5 stars
  review?: string; // Text review/critique
}

export interface ReadingStats {
  booksRead: number;
  currentlyReading: number;
  pagesThisYear: number;
}
