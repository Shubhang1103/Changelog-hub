import React from 'react';

/**
 * Reusable accessible Button primitive.
 */
export const Button = React.forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      leftIcon = null,
      rightIcon = null,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] rounded-lg';

    const variants = {
      primary:
        'bg-accent hover:bg-ink text-paper focus-visible:ring-accent border border-accent',
      secondary:
        'bg-ink/5 hover:bg-ink/10 text-ink border border-line focus-visible:ring-accent',
      outline:
        'bg-transparent hover:bg-accent-soft text-ink-soft hover:text-ink border border-line focus-visible:ring-accent',
      ghost:
        'bg-transparent hover:bg-accent-soft text-ink-soft hover:text-ink focus-visible:ring-accent',
      danger:
        'bg-cat-fixed hover:bg-ink text-paper focus-visible:ring-cat-fixed border border-cat-fixed',
      pill:
        'bg-accent-soft hover:bg-accent text-accent hover:text-paper border border-accent-soft focus-visible:ring-accent',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2.5',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={`${baseStyles} ${variants[variant] || variants.primary} ${
          sizes[size] || sizes.md
        } ${className}`}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
