import clsx from 'clsx';

type BadgeVariant = 'solid' | 'outline';
type BadgeColor = 'slate' | 'blue' | 'green' | 'amber' | 'red';

const COLOR_MAP: Record<
  BadgeColor,
  { solid: string; outline: string; text: string; ring: string }
> = {
  slate: {
    solid: 'bg-slate-200 text-slate-800',
    outline: 'text-slate-700',
    text: 'text-slate-700',
    ring: 'ring-slate-300',
  },
  blue: {
    solid: 'bg-blue-100 text-blue-800',
    outline: 'text-blue-700',
    text: 'text-blue-700',
    ring: 'ring-blue-300',
  },
  green: {
    solid: 'bg-emerald-100 text-emerald-800',
    outline: 'text-emerald-700',
    text: 'text-emerald-700',
    ring: 'ring-emerald-300',
  },
  amber: {
    solid: 'bg-amber-100 text-amber-800',
    outline: 'text-amber-700',
    text: 'text-amber-700',
    ring: 'ring-amber-300',
  },
  red: {
    solid: 'bg-rose-100 text-rose-800',
    outline: 'text-rose-700',
    text: 'text-rose-700',
    ring: 'ring-rose-300',
  },
};

type BadgeProps = {
  text: string;
  variant?: BadgeVariant;
  color?: BadgeColor;
  icon?: React.ReactNode;
  className?: string;
};

export function Badge({
  text,
  variant = 'solid',
  color = 'slate',
  icon,
  className,
}: BadgeProps) {
  const palette = COLOR_MAP[color];
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
        variant === 'solid'
          ? palette.solid
          : clsx('ring-1 ring-inset', palette.text, palette.ring),
        className
      )}
    >
      {icon}
      {text}
    </span>
  );
}

export default Badge;

