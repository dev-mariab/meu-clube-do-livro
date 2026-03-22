import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth, AuthUser } from "../lib/supabase";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    let sessionCheckTimeout: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log("[AuthProvider] Initializing auth...");

        // First, try to get session immediately
        const { data: { session } } = await auth.supabase.auth.getSession();
        
        if (isSubscribed) {
          if (session?.user) {
            console.log("[AuthProvider] Found existing session:", { userEmail: session.user.email });
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.name,
            });
          } else {
            console.log("[AuthProvider] No existing session found");
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("[AuthProvider] Error in getSession:", error);
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state change listener
    console.log("[AuthProvider] Setting up auth listener");
    const { data: { subscription } } = auth.supabase.auth.onAuthStateChange((_event, session) => {
      console.log("[AuthProvider] Auth state changed:", { event: _event, hasUser: !!session?.user });
      
      if (isSubscribed) {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name,
          });
        } else {
          setUser(null);
        }
        setIsLoading(false);
        
        // Cancel the timeout since we got a response
        if (sessionCheckTimeout) {
          clearTimeout(sessionCheckTimeout);
        }
      }
    });

    // Initialize with a timeout fallback
    initializeAuth();
    
    // Fallback timeout to ensure isLoading isn't stuck forever
    sessionCheckTimeout = setTimeout(() => {
      if (isSubscribed) {
        console.warn("[AuthProvider] Session check timeout, stopping loading");
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      isSubscribed = false;
      clearTimeout(sessionCheckTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
