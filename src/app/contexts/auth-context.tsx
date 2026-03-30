import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { postgresDb, AuthUser } from "../lib/postgresdb";

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

    const initializeAuth = async () => {
      try {
        console.log("[AuthProvider] Initializing auth...");

        // Get stored session
        const session = await postgresDb.getSession();
        
        if (isSubscribed) {
          if (session?.user) {
            console.log("[AuthProvider] Found existing session:", { userEmail: session.user.email });
            setUser(session.user);
          } else {
            console.log("[AuthProvider] No existing session found");
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("[AuthProvider] Error in initialization:", error);
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state change listener
    console.log("[AuthProvider] Setting up auth listener");
    const unsubscribe = postgresDb.onAuthStateChange((user) => {
      console.log("[AuthProvider] Auth state changed:", { hasUser: !!user });
      
      if (isSubscribed) {
        setUser(user);
        setIsLoading(false);
      }
    });

    // Initialize with first check
    initializeAuth();
    
    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      postgresDb.signOut();
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
