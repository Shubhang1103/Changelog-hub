import React from 'react';

/**
 * Reusable Badge primitive for categories, statuses, and tags.
 */
export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
  ...props
}) => {
  const base =
    'inline-flex items-center font-mono uppercase font-medium rounded-full tracking-widest transition-colors select-none';

  const variants = {
    default: 'text-ink-soft border border-line',
    // Categories
    New: 'text-ink-soft border-transparent',
    Improved: 'text-ink-soft border-transparent',
    Fixed: 'text-ink-soft border-transparent',
    // Statuses
    Published: 'text-accent border border-accent/30',
    Draft: 'text-ink-soft border border-line',
    // Roles
    admin: 'text-cat-fixed border border-cat-fixed/30',
    user: 'text-cat-improved border border-cat-improved/30',
  };

  const dotColors = {
    default: 'bg-ink-soft',
    New: 'bg-cat-new',
    Improved: 'bg-cat-improved',
    Fixed: 'bg-cat-fixed',
    Published: 'bg-accent',
    Draft: 'bg-ink-soft',
    admin: 'bg-cat-fixed',
    user: 'bg-cat-improved',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-[11px] px-2.5 py-1 gap-1.5',
    lg: 'text-xs px-3.5 py-1.5 gap-2',
  };

  return (
    <span
      className={`${base} ${variants[variant] || variants.default} ${
        sizes[size] || sizes.md
      } ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotColors[variant] || dotColors.default}`}
        />
      )}
      {children}
    </span>
  );
};
