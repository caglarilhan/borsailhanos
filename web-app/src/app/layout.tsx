import type { Metadata } from "next";
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
  title: "BIST AI Smart Trader",
  description: "Yapay zeka destekli BIST hisse senedi analiz ve tahmin platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-graphite-900 text-gray-200`}
        suppressHydrationWarning={true}
      >
        <div suppressHydrationWarning={true}>
          {children}
        </div>
      </body>
    </html>
  );
}
