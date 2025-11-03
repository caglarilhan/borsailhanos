'use client';
import React from 'react';

export function UpdateBadge({ time, title }: { time: string; title?: string }) {
  return (
    <span className="badge badge-muted" title={title || 'Son güncelleme'}>
      ⏱ {time}
    </span>
  );
}


