import { projectId, publicAnonKey } from "../../../supabase/info";
import { Book, ReadingStats } from "../types";
import { auth } from "./supabase";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-93f7c220`;

let refreshPromise: Promise<void> | null = null;

type Goals = { yearlyBookGoal: number | null; yearlyPageGoal: number | null };

function isAuthFailureMessage(message: string): boolean {
  return /session_expired|invalid\s+jwt|unauthorized|not authenticated/i.test(message);
}

async function getUserStorageSuffix(): Promise<string> {
  const { data } = await auth.supabase.auth.getSession();
  return data?.session?.user?.id || "guest";
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

  const pagesThisYear = books
    .filter((b) => {
      const completedAt = (b as any).completedAt as string | undefined;
      if (!completedAt || b.status !== "completed") return false;
      return new Date(completedAt).getFullYear() === currentYear;
    })
    .reduce((sum, b) => sum + (b.totalPages || 0), 0);

  return { booksRead, currentlyReading, pagesThisYear };
}

async function getHeaders() {
  try {
    // Nao faz refresh por request para evitar corrida com refresh token.
    const { data, error } = await auth.supabase.auth.getSession();
    if (error) {
      throw new Error(error.message || "Not authenticated");
    }

    const session = data?.session;
    if (!session?.access_token) {
      throw new Error("Not authenticated");
    }

    return {
      apikey: publicAnonKey,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    };
  } catch (error) {
    console.error("[API] ❌ Error getting headers:", error);
    throw error;
  }
}

async function refreshSessionSafely(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const { error } = await auth.supabase.auth.refreshSession();
      if (error) {
        throw new Error(error.message || "Failed to refresh session");
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function fetchWithAuth(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = await getHeaders();
  let response = await fetch(input, {
    ...init,
    headers: {
      ...headers,
      ...(init.headers || {}),
    },
  });

  // Retry once on 401 to handle token propagation/expiry race right after login.
  if (response.status === 401) {
    try {
      await refreshSessionSafely();
      const retryHeaders = await getHeaders();
      response = await fetch(input, {
        ...init,
        headers: {
          ...retryHeaders,
          ...(init.headers || {}),
        },
      });
    } catch {
      // Ignored here; handled below as auth failure.
    }
  }

  return response;
}

async function handleAuthError(response: Response, fallbackMessage: string): Promise<never> {
  const errorData = await response.json().catch(() => ({} as any));
  const rawMessage = errorData?.error || errorData?.message || fallbackMessage;
  const message = String(rawMessage);

  const isAuthFailure =
    response.status === 401 ||
    /invalid\s+jwt/i.test(message) ||
    /unauthorized/i.test(message);

  if (isAuthFailure) {
    throw new Error("SESSION_EXPIRED");
  }

  throw new Error(message || fallbackMessage);
}

export const api = {
  // Upload book cover
  async uploadCover(imageData: string, fileName: string): Promise<string> {
    try {
      const response = await fetchWithAuth(`${API_URL}/upload-cover`, {
        method: "POST",
        body: JSON.stringify({ image: imageData, fileName }),
      });

      if (!response.ok) {
        return handleAuthError(response, "Failed to upload cover");
      }

      const data = await response.json();
      return data.url;
    } catch {
      // Fallback: usa a propria imagem em base64 quando upload remoto falhar.
      return imageData;
    }
  },

  // Get all books
  async getBooks(): Promise<Book[]> {
    try {
      const response = await fetchWithAuth(`${API_URL}/books`);
      
      if (!response.ok) {
        return handleAuthError(response, `Failed to fetch books (${response.status})`);
      }
      
      const data = await response.json();
      return data.books;
    } catch (error: any) {
      console.error("Error in getBooks:", error);
      if (isAuthFailureMessage(String(error?.message || ""))) {
        return getLocalBooks();
      }
      throw error;
    }
  },

  // Get single book
  async getBook(id: string): Promise<Book> {
    try {
      const response = await fetchWithAuth(`${API_URL}/books/${id}`);
      if (!response.ok) {
        return handleAuthError(response, "Failed to fetch book");
      }
      const data = await response.json();
      return data.book;
    } catch (error: any) {
      if (isAuthFailureMessage(String(error?.message || ""))) {
        const books = await getLocalBooks();
        const found = books.find((b) => b.id === id);
        if (!found) throw new Error("Book not found");
        return found;
      }
      throw error;
    }
  },

  // Create a new book
  async createBook(bookData: Omit<Book, "id" | "createdAt" | "updatedAt">): Promise<Book> {
    try {
      const response = await fetchWithAuth(`${API_URL}/books`, {
        method: "POST",
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        return handleAuthError(response, "Failed to create book");
      }

      return response.json();
    } catch (error: any) {
      if (isAuthFailureMessage(String(error?.message || ""))) {
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
      const response = await fetchWithAuth(`${API_URL}/books/${id}`, {
        method: "PUT",
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        return handleAuthError(response, "Failed to update book");
      }

      return response.json();
    } catch (error: any) {
      if (isAuthFailureMessage(String(error?.message || ""))) {
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
      const response = await fetchWithAuth(`${API_URL}/books/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        return handleAuthError(response, "Failed to delete book");
      }
    } catch (error: any) {
      if (isAuthFailureMessage(String(error?.message || ""))) {
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
      const response = await fetchWithAuth(`${API_URL}/stats`);
      
      if (!response.ok) {
        return handleAuthError(response, `Failed to fetch stats (${response.status})`);
      }
      
      return response.json();
    } catch (error: any) {
      console.error("Error in getStats:", error);
      if (isAuthFailureMessage(String(error?.message || ""))) {
        const books = await getLocalBooks();
        return computeStatsFromBooks(books);
      }
      throw error;
    }
  },

  // Get reading goals
  async getGoals(): Promise<{ yearlyBookGoal: number | null; yearlyPageGoal: number | null }> {
    try {
      const response = await fetchWithAuth(`${API_URL}/goals`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to fetch goals:", response.status, errorData);

        const errorMessage = String(errorData?.error || errorData?.message || "");
        if (response.status === 401 || /invalid\s+jwt/i.test(errorMessage) || /unauthorized/i.test(errorMessage)) {
          throw new Error("SESSION_EXPIRED");
        }
        
        // If goals don't exist yet, return defaults instead of error
        if (response.status === 404 || response.status === 500) {
          return {
            yearlyBookGoal: null,
            yearlyPageGoal: null,
          };
        }
        throw new Error(errorData.error || `Failed to fetch goals (${response.status})`);
      }
      
      return response.json();
    } catch (error: any) {
      console.error("Error in getGoals:", error);
      if (isAuthFailureMessage(String(error?.message || ""))) {
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
      console.log("[API setGoals] ========== Setting goals ==========");
      console.log("[API setGoals] Input:", { yearlyBookGoal, yearlyPageGoal });
      
      console.log("[API setGoals] Making POST request to:", `${API_URL}/goals`);
      
      const requestBody = { yearlyBookGoal, yearlyPageGoal };
      console.log("[API setGoals] Request body:", requestBody);
      
      const response = await fetchWithAuth(`${API_URL}/goals`, {
        method: "POST",
        body: JSON.stringify(requestBody),
      });
      
      console.log("[API setGoals] Response status:", response.status);
      console.log("[API setGoals] Response ok:", response.ok);
      
      if (!response.ok) {
        return handleAuthError(response, "Failed to set goals");
      }
      
      const responseData = await response.json();
      console.log("[API setGoals] ✅ Success! Response data:", responseData);
    } catch (error: any) {
      console.error("[API setGoals] ❌❌❌ Exception caught:", error);
      if (isAuthFailureMessage(String(error?.message || ""))) {
        await setLocalGoals({ yearlyBookGoal, yearlyPageGoal });
        return;
      }
      throw error;
    }
  },
};