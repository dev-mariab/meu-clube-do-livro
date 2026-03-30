import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "../contexts/theme-context";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
      title={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-slate-600" />
      ) : (
        <Sun className="h-5 w-5 text-yellow-400" />
      )}
    </Button>
  );
}
