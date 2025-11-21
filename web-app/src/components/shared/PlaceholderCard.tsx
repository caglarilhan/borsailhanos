'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';
import { Badge } from './Badge';

type PlaceholderCardProps = {
  title: string;
  description?: string;
  badge?: { text: string; color?: 'slate' | 'blue' | 'green' | 'amber' | 'red' };
  actions?: ReactNode;
  className?: string;
};

export function PlaceholderCard({
  title,
  description,
  badge,
  actions,
  className,
}: PlaceholderCardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-dashed border-slate-300/60 bg-white p-6 text-slate-700 shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
        {badge && (
          <Badge
            text={badge.text}
            color={badge.color ?? 'amber'}
            variant="outline"
          />
        )}
      </div>
      {actions && <div className="mt-4">{actions}</div>}
    </div>
  );
}

export default PlaceholderCard;

