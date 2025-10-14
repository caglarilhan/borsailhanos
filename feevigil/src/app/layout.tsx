import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FeeVigil",
  description: "See through the fees. Guard your margins automatically.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* JS fallback kaldırıldı; Tailwind/CSS ile kalıcı hale getirildi */}
        <header className="w-full bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-900 hover:text-green-600 transition-colors">
              <span className="inline-block h-2 w-2 rounded-sm bg-green-600" aria-hidden />
              <span className="text-xl font-bold">FeeVigil</span>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Dashboard</Link>
              <Link href="/onboarding" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Onboarding</Link>
              <Link href="/admin" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Admin</Link>
              <Link href="/api/health" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">API Health</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
