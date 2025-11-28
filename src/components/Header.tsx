'use client';

import Link from "next/link";
import Image from "next/image";

type HeaderProps = {
  title: string;
  subtitle?: string;
  homeHref?: string;
  showThemeToggle?: boolean;
};

export function Header({ title, subtitle, homeHref = "/" }: HeaderProps) {
  return (
    <header className="theme-card flex items-center justify-between rounded-2xl px-6 py-1">
      <div className="flex items-center gap-4">
        <Link href={homeHref}>
          <Image src="/logonobg.png" alt="Ir al inicio" width={180} height={180} priority />
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold theme-title">{title}</h1>
          {subtitle && <p className="text-sm theme-muted">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}
