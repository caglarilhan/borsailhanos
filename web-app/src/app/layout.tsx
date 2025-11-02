import { Inter } from "next/font/google";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import Providers from "./providers";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "BIST AI Smart Trader",
  description: "AI-powered quantitative trading dashboard",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={inter.variable} suppressHydrationWarning>
      <body
        className="antialiased font-inter bg-white text-[#111827] dark:bg-[#0B0C10] dark:text-[#EAEAEA]"
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
