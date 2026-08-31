import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const initialized = useRef(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("mailcloud-theme");
    const initialTheme: Theme = storedTheme === "dark" ? "dark" : "light";
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    window.localStorage.setItem("mailcloud-theme", initialTheme);
    initialized.current = true;
  }, []);

  useEffect(() => {
    if (!initialized.current) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("mailcloud-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => current === "light" ? "dark" : "light");
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}

export { ThemeProvider, useTheme };
