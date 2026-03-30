// Client para comunicação com API backend (sem Supabase)
// Usa JWT armazenado em localStorage

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

interface StoredSession {
  token: string;
  user: AuthUser;
  expiresAt: number;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const API_PREFIX = "/make-server-93f7c220";

function getStoredSession(): StoredSession | null {
  try {
    const stored = localStorage.getItem("auth_session");
    if (!stored) return null;
    
    const session = JSON.parse(stored) as StoredSession;
    
    // Check if token is expired
    if (session.expiresAt && session.expiresAt < Date.now()) {
      localStorage.removeItem("auth_session");
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
}

function saveSession(token: string, user: AuthUser, expiresInDays: number = 7): void {
  const expiresAt = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;
  localStorage.setItem(
    "auth_session",
    JSON.stringify({ token, user, expiresAt })
  );
}

function clearSession(): void {
  localStorage.removeItem("auth_session");
}

function getAuthHeaders(): Record<string, string> {
  const session = getStoredSession();
  return {
    "Content-Type": "application/json",
    ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
  };
}

async function fetchApi(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_URL}${API_PREFIX}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 - token expired/invalid
  if (response.status === 401) {
    clearSession();
    // Window location will be handled by AuthContext
  }

  return response;
}

export const postgresDb = {
  // Auth methods
  async signup(email: string, password: string, name?: string) {
    const response = await fetchApi("/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to sign up");
    }

    const data = await response.json();
    saveSession(data.token, data.user);
    return data;
  },

  async login(email: string, password: string) {
    const response = await fetchApi("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Invalid login credentials");
    }

    const data = await response.json();
    saveSession(data.token, data.user);
    return data;
  },

  async getSession(): Promise<StoredSession | null> {
    return getStoredSession();
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const session = getStoredSession();
    return session?.user || null;
  },

  signOut(): void {
    clearSession();
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    // Check initial state
    const session = getStoredSession();
    callback(session?.user || null);

    // Listen to storage changes (for cross-tab sign out)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_session") {
        const newSession = e.newValue ? JSON.parse(e.newValue) : null;
        callback(newSession?.user || null);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  },

  // Book methods
  async getBooks() {
    const response = await fetchApi("/books");

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to fetch books");
    }

    return response.json();
  },

  async getBook(id: string) {
    const response = await fetchApi(`/books/${id}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to fetch book");
    }

    return response.json();
  },

  async createBook(bookData: any) {
    const response = await fetchApi("/books", {
      method: "POST",
      body: JSON.stringify(bookData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to create book");
    }

    return response.json();
  },

  async updateBook(id: string, updates: any) {
    const response = await fetchApi(`/books/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to update book");
    }

    return response.json();
  },

  async deleteBook(id: string) {
    const response = await fetchApi(`/books/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to delete book");
    }

    return response.json();
  },

  async getStats() {
    const response = await fetchApi("/stats");

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to fetch stats");
    }

    return response.json();
  },

  async getGoals() {
    const response = await fetchApi("/goals");

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to fetch goals");
    }

    return response.json();
  },

  async setGoals(bookGoal: number | null, pageGoal: number | null) {
    const response = await fetchApi("/goals", {
      method: "POST",
      body: JSON.stringify({
        yearlyBookGoal: bookGoal,
        yearlyPageGoal: pageGoal,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to set goals");
    }

    return response.json();
  },

  // Get the client for direct access if needed
  async uploadCover(_imageData: string, _fileName: string): Promise<string> {
    // Imagens serão salvas como base64 direto no campo cover_url do banco
    // Quando enviadas no createBook/updateBook
    throw new Error("Use cover_url field directly in book data");
  },
};

export type PostgresDb = typeof postgresDb;
