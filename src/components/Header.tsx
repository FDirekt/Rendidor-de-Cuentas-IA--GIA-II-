'use client';

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "./ThemeProvider";

type HeaderProps = {
  title: string;
  subtitle?: string;
  homeHref?: string;
  showThemeToggle?: boolean;
};

export function Header({ title, subtitle, homeHref = "/", showThemeToggle = true }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="theme-card flex items-center justify-between rounded-2xl px-6 py-5">
      <div className="flex items-center gap-4">
        <Link href={homeHref}>
          <Image src="/logo/logomid.png" alt="Ir al inicio" width={150} height={150} priority />
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold theme-title">{title}</h1>
          {subtitle && <p className="text-sm theme-muted">{subtitle}</p>}
        </div>
      </div>
      {showThemeToggle && (
        <button
          onClick={toggleTheme}
          className="theme-toggle flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition hover:-translate-y-0.5"
          aria-label="Cambiar tema"
        >
          {isDark ? "Modo claro ☀️" : "Modo oscuro 🌙"}
        </button>
      )}
    </header>
  );
}
