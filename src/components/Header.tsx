'use client';

import Link from "next/link";
import Image from "next/image";

type HeaderProps = {
  title: string;
  subtitle?: string;
  homeHref?: string;
  backHref?: string;
  backLabel?: string;
  showThemeToggle?: boolean;
};

export function Header({ title, subtitle, homeHref = "/", backHref, backLabel = "Volver a inicio" }: HeaderProps) {
  return (
    <header className="theme-card flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-3">
      <div className="flex items-center gap-4">
        <Link href={homeHref}>
          <Image src="/logonobg.png" alt="Ir al inicio" width={180} height={180} priority />
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold theme-title">{title}</h1>
          {subtitle && <p className="text-sm theme-muted">{subtitle}</p>}
        </div>
      </div>
      {backHref && (
        <Link
          href={backHref}
          className="rounded-full border border-[color:var(--border)] px-4 py-2 text-xs font-semibold theme-muted transition hover:border-[color:var(--accent)]"
        >
          {backLabel}
        </Link>
      )}
    </header>
  );
}
