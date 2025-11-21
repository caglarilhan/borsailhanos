import clsx from 'clsx';
import { ReactNode } from 'react';

type CardProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Card({
  title,
  subtitle,
  actions,
  children,
  className,
}: CardProps) {
  return (
    <section
      className={clsx(
        'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
        'md:p-6',
        className
      )}
    >
      {(title || actions) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && (
              <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export default Card;

