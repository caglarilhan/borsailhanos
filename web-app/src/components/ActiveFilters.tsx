'use client';

import React from 'react';

interface ActiveFiltersProps {
  filters: Array<{ label: string; value: string | boolean | string[]; onRemove?: () => void }>;
}

export function ActiveFilters({ filters }: ActiveFiltersProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <span className="text-xs text-slate-600 font-medium">Aktif Filtreler:</span>
      {filters.map((filter, idx) => (
        <span
          key={idx}
          className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1"
        >
          {typeof filter.value === 'boolean' ? (
            filter.label
          ) : Array.isArray(filter.value) ? (
            `${filter.label}: ${filter.value.join(', ')}`
          ) : (
            `${filter.label}: ${filter.value}`
          )}
          {filter.onRemove && (
            <button
              onClick={(e) => { e.stopPropagation(); filter.onRemove?.(); }}
              className="ml-1 text-blue-600 hover:text-blue-800 font-bold"
              aria-label={`${filter.label} filtresini kaldır`}
            >
              ×
            </button>
          )}
        </span>
      ))}
    </div>
  );
}

