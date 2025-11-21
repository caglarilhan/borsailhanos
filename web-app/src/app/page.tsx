"use client";

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-6 text-center text-slate-800">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        BIST AI Smart Trader
      </p>
      <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
        AI destekli sinyal motoru
      </h1>
      <p className="mt-4 max-w-xl text-sm text-slate-600">
        Sinyaller, risk motoru ve sentiment panellerini görüntülemek için dashboard&apos;a geç.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500"
        >
          Dashboard&apos;a git
        </Link>
        <Link
          href="/pricing"
          className="rounded-full border border-slate-300 px-6 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
        >
          Planları Gör
        </Link>
      </div>
    </div>
  );
}