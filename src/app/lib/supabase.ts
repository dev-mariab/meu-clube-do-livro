import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../../supabase/info";

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Expose for debugging
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export const auth = {
  // Expose supabase client for direct access when needed
  supabase: supabase,
  
  // Get current session with automatic refresh
  async getSession() {
    try {
      // This will automatically refresh the token if expired
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("[Auth] Error getting session:", error);
        return null;
      }
      
      // If we have a session, verify it's valid
      if (data.session) {
        // Check if token is about to expire (within 60 seconds)
        const expiresAt = data.session.expires_at;
        const now = Math.floor(Date.now() / 1000);
        
        if (expiresAt && expiresAt - now < 60) {
          console.log("[Auth] Token expiring soon, refreshing...");
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error("[Auth] Error refreshing session:", refreshError);
            return null;
          }
          
          return refreshData.session;
        }
      }
      
      return data.session;
    } catch (error) {
      console.error("[Auth] Exception in getSession:", error);
      return null;
    }
  },

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    const session = await this.getSession();
    if (!session) return null;
    
    return {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.user_metadata?.name,
    };
  },

  // Sign in with email/password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data.session?.access_token;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Listen to auth changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name,
        });
      } else {
        callback(null);
      }
    });
  },
};

// Expose for debugging
if (typeof window !== 'undefined') {
  (window as any).auth = auth;
}