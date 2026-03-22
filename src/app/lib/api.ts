import { projectId, publicAnonKey } from "../../../supabase/info";
import { Book, ReadingStats } from "../types";
import { auth } from "./supabase";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-93f7c220`;

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
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/upload-cover`, {
      method: "POST",
      headers,
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
      const headers = await getHeaders();
      const response = await fetch(`${API_URL}/books`, { headers });
      
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
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/books/${id}`, { headers });
    if (!response.ok) {
      return handleAuthError(response, "Failed to fetch book");
    }
    const data = await response.json();
    return data.book;
  },

  // Create a new book
  async createBook(bookData: Omit<Book, "id" | "createdAt" | "updatedAt">): Promise<Book> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/books`, {
      method: "POST",
      headers,
      body: JSON.stringify(bookData),
    });
    
    if (!response.ok) {
      return handleAuthError(response, "Failed to create book");
    }
    
    return response.json();
  },

  // Update a book
  async updateBook(id: string, bookData: Partial<Book>): Promise<Book> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/books/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(bookData),
    });
    
    if (!response.ok) {
      return handleAuthError(response, "Failed to update book");
    }
    
    return response.json();
  },

  // Delete book
  async deleteBook(id: string): Promise<void> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/books/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!response.ok) {
      return handleAuthError(response, "Failed to delete book");
    }
  },

  // Get reading stats
  async getStats(): Promise<ReadingStats> {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_URL}/stats`, {
        headers,
      });
      
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
      const headers = await getHeaders();
      const response = await fetch(`${API_URL}/goals`, {
        headers,
      });
      
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
      
      const headers = await getHeaders();
      console.log("[API setGoals] Headers obtained, making POST request to:", `${API_URL}/goals`);
      
      const requestBody = { yearlyBookGoal, yearlyPageGoal };
      console.log("[API setGoals] Request body:", requestBody);
      
      const response = await fetch(`${API_URL}/goals`, {
        method: "POST",
        headers,
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