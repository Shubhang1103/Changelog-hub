import React from 'react';

/**
 * Reusable accessible Textarea primitive.
 */
export const Textarea = React.forwardRef(
  (
    {
      label,
      error,
      hint,
      className = '',
      id,
      name,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const inputId = id || name;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          name={name}
          rows={rows}
          className={`w-full rounded-xl border bg-slate-900/90 text-slate-100 placeholder-slate-500 text-sm p-3.5 transition-all duration-150 focus:outline-none focus:ring-2 focus:border-transparent ${
            error
              ? 'border-rose-500/80 focus:ring-rose-500/50 text-rose-100'
              : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/30'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
