import { Outlet, NavLink } from "react-router";
import { Home, Library, Target, Settings, Menu, X, LogOut, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/auth-context";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { toast } from "sonner";

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Até logo! ✨");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erro ao fazer logout");
    }
  };

  const navItems = [
    { to: "/", label: "Início", icon: Home },
    { to: "/biblioteca", label: "Minha Biblioteca", icon: Library },
    { to: "/metas", label: "Metas de Leitura", icon: Target },
    { to: "/configuracoes", label: "Configurações", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-pink-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between shadow-sm transition-colors">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-500" />
          <h1 className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
            MinhaEstante
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-pink-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {isSidebarOpen ? (
              <X className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            ) : (
              <Menu className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            )}
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-pink-200 dark:border-slate-700 flex flex-col
          transform transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-6 border-b border-pink-200 dark:border-slate-700 hidden lg:block transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-pink-500" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
              MinhaEstante
            </h1>
          </div>
          <p className="text-sm text-pink-600/80 dark:text-slate-400">Suas leituras ✨</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-16 lg:mt-0">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-300/50 dark:shadow-purple-900/50"
                    : "text-pink-700 dark:text-slate-300 hover:bg-pink-100/80 dark:hover:bg-slate-800"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-pink-200 dark:border-slate-700 space-y-3 transition-colors">
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl transition-colors">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold shadow-lg">
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-pink-900 dark:text-white truncate">
                {user?.name || "Usuário"}
              </p>
              <p className="text-xs text-pink-600/80 dark:text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <ThemeToggle />
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="flex-1 justify-start text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 hover:bg-pink-50 dark:hover:bg-slate-800 border-pink-200 dark:border-slate-700 rounded-xl"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}