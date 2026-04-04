import { Book, ReadingStats } from "../types";
import { postgresDb } from "./postgresdb";

// Detectar ambiente e usar URL correta
const isDevelopment = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type Goals = { yearlyBookGoal: number | null; yearlyPageGoal: number | null };

async function getUserStorageSuffix(): Promise<string> {
  const session = await postgresDb.getSession();
  return session?.user?.id || "guest";
}

async function getBooksStorageKey(): Promise<string> {
  const suffix = await getUserStorageSuffix();
  return `mcl_books_${suffix}`;
}

async function getGoalsStorageKey(): Promise<string> {
  const suffix = await getUserStorageSuffix();
  return `mcl_goals_${suffix}`;
}

async function getLocalBooks(): Promise<Book[]> {
  const key = await getBooksStorageKey();
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Book[];
  } catch {
    return [];
  }
}

async function setLocalBooks(books: Book[]): Promise<void> {
  const key = await getBooksStorageKey();
  localStorage.setItem(key, JSON.stringify(books));
}

async function getLocalGoals(): Promise<Goals> {
  const key = await getGoalsStorageKey();
  const raw = localStorage.getItem(key);
  if (!raw) return { yearlyBookGoal: null, yearlyPageGoal: null };
  try {
    const parsed = JSON.parse(raw) as Goals;
    return {
      yearlyBookGoal: parsed.yearlyBookGoal ?? null,
      yearlyPageGoal: parsed.yearlyPageGoal ?? null,
    };
  } catch {
    return { yearlyBookGoal: null, yearlyPageGoal: null };
  }
}

async function setLocalGoals(goals: Goals): Promise<void> {
  const key = await getGoalsStorageKey();
  localStorage.setItem(key, JSON.stringify(goals));
}

function computeStatsFromBooks(books: Book[]): ReadingStats {
  const booksRead = books.filter((b) => b.status === "completed").length;
  const currentlyReading = books.filter((b) => b.status === "reading").length;
  const currentYear = new Date().getFullYear();

  // Contar páginas lidas: 
  // - Para livros completados este ano: total de páginas
  // - Para livros em leitura: páginas já lidas (currentPage)
  const pagesThisYear = books.reduce((sum, b) => {
    // Livros completados neste ano contam todas as páginas
    if (b.status === "completed") {
      const completedAt = (b as any).completedAt as string | undefined;
      if (completedAt && new Date(completedAt).getFullYear() === currentYear) {
        return sum + (b.totalPages || 0);
      }
    }
    // Livros em leitura contam apenas as páginas já lidas
    if (b.status === "reading" && b.currentPage) {
      return sum + b.currentPage;
    }
    return sum;
  }, 0);

  return { booksRead, currentlyReading, pagesThisYear };
}

export const api = {
  // Upload book cover - with new backend, cover is stored as base64 in cover_url field
  async uploadCover(imageData: string, _fileName: string): Promise<string> {
    // Return the base64 data directly - it will be stored in the book's cover_url field
    return imageData;
  },

  // Get all books
  async getBooks(): Promise<Book[]> {
    try {
      const data = await postgresDb.getBooks();
      return Array.isArray(data) ? data : (data.books || []);
    } catch (error: any) {
      console.error("Error in getBooks:", error);
      if (error.message?.includes("Unauthorized")) {
        return getLocalBooks();
      }
      throw error;
    }
  },

  // Get single book
  async getBook(id: string): Promise<Book> {
    try {
      const data = await postgresDb.getBook(id);
      return transformBook(data); // Garante que o retorno seja do tipo `Book`
    } catch (error: any) {
      if (error.message?.includes("Unauthorized")) {
        postgresDb.signOut();
      }
      throw error;
    }
  },

  // Create a new book
  async createBook(bookData: Omit<Book, "id" | "createdAt" | "updatedAt">): Promise<Book> {
    try {
      const payload = {
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn,
        category: bookData.category,
        status: bookData.status,
        progress: bookData.progress,
        current_page: bookData.currentPage,
        total_pages: bookData.totalPages,
        cover_url: (bookData as any).coverUrl || null,
      };

      return postgresDb.createBook(payload);
    } catch (error: any) {
      if (error.message?.includes("Unauthorized")) {
        const books = await getLocalBooks();
        const localBook: Book = {
          id: crypto.randomUUID(),
          title: bookData.title,
          author: bookData.author,
          isbn: bookData.isbn,
          category: bookData.category,
          status: bookData.status,
          progress: bookData.progress,
          coverUrl: (bookData as any).coverUrl || "",
          totalPages: bookData.totalPages,
          currentPage: bookData.currentPage,
          ...(bookData.status === "completed" ? ({ completedAt: new Date().toISOString() } as any) : {}),
        };
        await setLocalBooks([localBook, ...books]);
        return localBook;
      }
      throw error;
    }
  },

  // Update a book
  async updateBook(id: string, bookData: Partial<Book>): Promise<Book> {
    try {
      const payload: any = {};
      if (bookData.title) payload.title = bookData.title;
      if (bookData.author) payload.author = bookData.author;
      if (bookData.isbn) payload.isbn = bookData.isbn;
      if (bookData.category) payload.category = bookData.category;
      if (bookData.status) payload.status = bookData.status;
      if (bookData.progress !== undefined) payload.progress = bookData.progress;
      if (bookData.currentPage !== undefined) payload.current_page = bookData.currentPage;
      if (bookData.totalPages !== undefined) payload.total_pages = bookData.totalPages;
      if (bookData.rating !== undefined) payload.rating = bookData.rating;
      if (bookData.review !== undefined) payload.review = bookData.review;
      if ((bookData as any).coverUrl !== undefined) {
        payload.cover_url = (bookData as any).coverUrl;
        console.log("[API] Updating cover_url, size:", (bookData as any).coverUrl?.length || 0);
      }
      
      if (bookData.status === "completed") {
        payload.completed_at = new Date().toISOString();
      }

      return postgresDb.updateBook(id, payload);
    } catch (error: any) {
      if (error.message?.includes("Unauthorized")) {
        const books = await getLocalBooks();
        const idx = books.findIndex((b) => b.id === id);
        if (idx < 0) throw new Error("Book not found");
        const updated: Book = {
          ...books[idx],
          ...bookData,
          ...(bookData.status === "completed" ? ({ completedAt: new Date().toISOString() } as any) : {}),
        };
        books[idx] = updated;
        await setLocalBooks(books);
        return updated;
      }
      throw error;
    }
  },

  // Delete book
  async deleteBook(id: string): Promise<void> {
    try {
      await postgresDb.deleteBook(id);
    } catch (error: any) {
      if (error.message?.includes("Unauthorized")) {
        const books = await getLocalBooks();
        await setLocalBooks(books.filter((b) => b.id !== id));
        return;
      }
      throw error;
    }
  },

  // Get reading stats
  async getStats(): Promise<ReadingStats> {
    try {
      return postgresDb.getStats();
    } catch (error: any) {
      console.error("Error in getStats:", error);
      if (error.message?.includes("Unauthorized")) {
        const books = await getLocalBooks();
        return computeStatsFromBooks(books);
      }
      throw error;
    }
  },

  // Get reading goals
  async getGoals(): Promise<{ yearlyBookGoal: number | null; yearlyPageGoal: number | null }> {
    try {
      return postgresDb.getGoals();
    } catch (error: any) {
      console.error("Error in getGoals:", error);
      if (error.message?.includes("Unauthorized")) {
        return getLocalGoals();
      }
      // Return default values if there's any error
      return {
        yearlyBookGoal: null,
        yearlyPageGoal: null,
      };
    }
  },

  // Set reading goals
  async setGoals(yearlyBookGoal: number | null, yearlyPageGoal: number | null): Promise<void> {
    try {
      console.log("[API setGoals] Setting goals:", { yearlyBookGoal, yearlyPageGoal });
      await postgresDb.setGoals(yearlyBookGoal, yearlyPageGoal);
      console.log("[API setGoals] ✅ Goals set successfully");
    } catch (error: any) {
      console.error("[API setGoals] ❌ Error:", error);
      if (error.message?.includes("Unauthorized")) {
        await setLocalGoals({ yearlyBookGoal, yearlyPageGoal });
        return;
      }
      throw error;
    }
  },

  // Update user profile
  async updateProfile(name: string): Promise<{ id: string; email: string; name: string }> {
    try {
      return await postgresDb.updateProfile(name);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },
};

// Ajusta a função transformBook para validar o tipo de entrada
function transformBook(data: any): Book {
  if (!data || typeof data !== "object" || !("book" in data)) {
    throw new Error("Invalid book data");
  }
  return data.book;
}