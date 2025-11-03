'use client';
import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  comment?: string;
}

export function AICommentModal({ open, onClose, title='AI Yorum Detayı', comment }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-w-xl w-full bg-white rounded-lg border border-slate-200 shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-slate-900 mb-2">{title}</h2>
        <div className="text-sm text-slate-700 whitespace-pre-wrap mb-4">{comment}</div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-xs rounded bg-slate-100 border">Kapat</button>
        </div>
      </div>
    </div>
  );
}


