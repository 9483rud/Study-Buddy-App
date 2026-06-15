import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { loadUserData, saveUserData } from "../utils/storage";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, userId }: { children: ReactNode; userId: string | null }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initialize from system preference
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  // Load theme from storage when userId changes
  useEffect(() => {
    if (userId) {
      const settings = loadUserData<{ theme: Theme }>(userId, "settings", { theme: "light" });
      if (settings.theme) {
        setThemeState(settings.theme);
      }
    }
  }, [userId]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (userId) {
      const currentSettings = loadUserData<any>(userId, "settings", {});
      saveUserData(userId, "settings", { ...currentSettings, theme: newTheme });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
