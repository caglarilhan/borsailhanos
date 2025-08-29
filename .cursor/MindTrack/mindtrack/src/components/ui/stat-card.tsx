"use client";

import * as React from "react";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  gradient?: "blue" | "green" | "purple" | "orange";
};

const gradients = {
  blue: "from-blue-50 to-indigo-50",
  green: "from-green-50 to-emerald-50",
  purple: "from-purple-50 to-violet-50",
  orange: "from-orange-50 to-amber-50",
} as const;

export function StatCard({ label, value, hint, icon, gradient = "blue" }: StatCardProps) {
  return (
    <div className={`rounded-2xl border shadow-sm bg-gradient-to-r ${gradients[gradient]}`}>
      <div className="p-5 flex items-center gap-4">
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-white/70 flex items-center justify-center text-gray-700">
            {icon}
          </div>
        )}
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-600">{label}</div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {hint && <div className="text-xs text-gray-600">{hint}</div>}
        </div>
      </div>
    </div>
  );
}


