"use client";

import * as React from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export function PageHeader({ title, subtitle, right }: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-2xl border bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="absolute inset-0 -z-10 opacity-60">
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-br from-blue-200 to-indigo-200 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-tr from-emerald-200 to-cyan-200 blur-3xl" />
      </div>
      <div className="px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm md:text-base text-gray-600">{subtitle}</p>
            )}
          </div>
          {right}
        </div>
      </div>
      <div className="h-[2px] w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />
    </header>
  );
}


