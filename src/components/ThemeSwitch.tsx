'use client';

import { useTheme } from "./ThemeProvider";

export function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle fixed bottom-4 right-4 z-50 rounded-full px-4 py-2 text-xs font-semibold shadow-lg transition hover:-translate-y-0.5"
      aria-label="Cambiar tema"
    >
      {isDark ? "☀️ Claro" : "🌙 Oscuro"}
    </button>
  );
}
