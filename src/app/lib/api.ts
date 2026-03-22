import { projectId, publicAnonKey } from "../../../supabase/info";
import { Book, ReadingStats } from "../types";
import { auth } from "./supabase";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-93f7c220`;

let refreshPromise: Promise<void> | null = null;

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
    // Sessao ficou invalida no cliente: limpa estado para ProtectedRoute redirecionar.
    await auth.signOut().catch(() => undefined);
    throw new Error("SESSION_EXPIRED");
  }

  throw new Error(message || fallbackMessage);
}

export const api = {
  // Upload book cover
  async uploadCover(imageData: string, fileName: string): Promise<string> {
    const response = await fetchWithAuth(`${API_URL}/upload-cover`, {
      method: "POST",
      body: JSON.stringify({ image: imageData, fileName }),
    });
    
    if (!response.ok) {
      return handleAuthError(response, "Failed to upload cover");
    }
    
    const data = await response.json();
    return data.url;
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
    } catch (error) {
      console.error("Error in getBooks:", error);
      throw error;
    }
  },

  // Get single book
  async getBook(id: string): Promise<Book> {
    const response = await fetchWithAuth(`${API_URL}/books/${id}`);
    if (!response.ok) {
      return handleAuthError(response, "Failed to fetch book");
    }
    const data = await response.json();
    return data.book;
  },

  // Create a new book
  async createBook(bookData: Omit<Book, "id" | "createdAt" | "updatedAt">): Promise<Book> {
    const response = await fetchWithAuth(`${API_URL}/books`, {
      method: "POST",
      body: JSON.stringify(bookData),
    });
    
    if (!response.ok) {
      return handleAuthError(response, "Failed to create book");
    }
    
    return response.json();
  },

  // Update a book
  async updateBook(id: string, bookData: Partial<Book>): Promise<Book> {
    const response = await fetchWithAuth(`${API_URL}/books/${id}`, {
      method: "PUT",
      body: JSON.stringify(bookData),
    });
    
    if (!response.ok) {
      return handleAuthError(response, "Failed to update book");
    }
    
    return response.json();
  },

  // Delete book
  async deleteBook(id: string): Promise<void> {
    const response = await fetchWithAuth(`${API_URL}/books/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      return handleAuthError(response, "Failed to delete book");
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
    } catch (error) {
      console.error("Error in getStats:", error);
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
          await auth.signOut().catch(() => undefined);
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
    } catch (error) {
      console.error("Error in getGoals:", error);
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
    } catch (error) {
      console.error("[API setGoals] ❌❌❌ Exception caught:", error);
      throw error;
    }
  },
};