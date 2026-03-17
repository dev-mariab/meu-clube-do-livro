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
}

export interface ReadingStats {
  booksRead: number;
  currentlyReading: number;
  pagesThisYear: number;
}
