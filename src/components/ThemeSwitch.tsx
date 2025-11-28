'use client';

import { useTheme } from "./ThemeProvider";

export function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const icon = isDark ? "🌙" : "☀️";
  const label = isDark ? "Tema oscuro activo" : "Tema claro activo";

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle fixed bottom-4 right-4 z-50 rounded-full px-4 py-2 text-base font-semibold shadow-lg transition hover:-translate-y-0.5"
      aria-label={`${label}. Haz click para alternar.`}
    >
      <span aria-hidden="true">{icon}</span>
      <span className="sr-only">{label}</span>
    </button>
  );
}
