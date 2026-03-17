import { projectId, publicAnonKey } from "/utils/supabase/info";
import { Book, ReadingStats } from "../types";
import { auth } from "./supabase";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-93f7c220`;

async function getHeaders() {
  try {
    console.log("[API] ========== Getting session ==========");
    const session = await auth.getSession();
    
    console.log("[API] Session data:", {
      hasSession: !!session,
      hasAccessToken: !!session?.access_token,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      tokenPreview: session?.access_token?.substring(0, 30),
      tokenLength: session?.access_token?.length,
      expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'N/A'
    });
    
    if (!session?.access_token) {
      console.error("[API] ❌ No valid session or access token available");
      throw new Error("Not authenticated");
    }
    
    console.log("[API] ✅ Creating authorization header with token");
    console.log("[API] Full token:", session.access_token);
    
    return {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    };
  } catch (error) {
    console.error("[API] ❌ Error getting headers:", error);
    throw error;
  }
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
      const error = await response.json();
      throw new Error(error.error || "Failed to upload cover");
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
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to fetch books:", response.status, errorData);
        throw new Error(errorData.error || `Failed to fetch books (${response.status})`);
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
      throw new Error("Failed to fetch book");
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
      const error = await response.json();
      throw new Error(error.error || "Failed to create book");
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
      const error = await response.json();
      throw new Error(error.error || "Failed to update book");
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
      throw new Error("Failed to delete book");
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
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to fetch stats:", response.status, errorData);
        throw new Error(errorData.error || `Failed to fetch stats (${response.status})`);
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
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/goals`, {
      method: "POST",
      headers,
      body: JSON.stringify({ yearlyBookGoal, yearlyPageGoal }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to set goals");
    }
  },
};