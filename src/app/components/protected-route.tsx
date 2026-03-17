import { Navigate } from "react-router";
import { useAuth } from "../contexts/auth-context";
import { Loader2, Sparkles } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-200 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-4">
            <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto" />
            <Sparkles className="w-5 h-5 text-purple-400 absolute top-0 right-1/3 animate-pulse" />
          </div>
          <p className="text-pink-700 font-medium">Carregando sua estante...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}