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
        <header className="w-full border-b border-gray-100">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-900 hover:opacity-80">
              <span className="inline-block h-2 w-2 rounded-sm bg-green-600" aria-hidden />
              <span className="text-base font-semibold">FeeVigil</span>
            </Link>
            <div className="text-sm text-gray-500">Guard your margins</div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
