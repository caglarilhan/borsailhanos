"use client";

import * as React from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto mb-4 flex items-center justify-center">!</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Bir şeyler ters gitti</h2>
            <p className="text-sm text-gray-600 mb-4">Lütfen tekrar deneyin veya ana sayfaya dönün.</p>
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => reset()} className="h-10 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-700">Tekrar Dene</button>
              <Link href="/" className="h-10 px-4 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">Ana Sayfa</Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}


