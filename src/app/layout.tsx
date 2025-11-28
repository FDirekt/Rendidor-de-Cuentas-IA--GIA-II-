import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeSwitch } from "@/components/ThemeSwitch";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Panel de casos",
  description: "Gestor de casos y documentos para Tribunal de Cuentas",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "64x64" },
      { url: "/logo/favicon.png", type: "image/png", sizes: "64x64" },
    ],
    shortcut: ["/favicon.png", "/logo/favicon.png"],
    apple: ["/favicon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased theme-shell`}
      >
        <ThemeProvider>
          {children}
          <ThemeSwitch />
        </ThemeProvider>
      </body>
    </html>
  );
}
