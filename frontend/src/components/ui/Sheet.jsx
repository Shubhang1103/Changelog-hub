import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Accessible Slide-Over Sheet / Drawer primitive.
 */
export const Sheet = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  width = 'max-w-md',
  position = 'right',
}) => {
  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className={`w-screen ${width} transform bg-paper border-l border-line shadow-2xl transition-all duration-300 ease-in-out flex flex-col`}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line p-6">
            <div>
              {title && <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink">{title}</h2>}
              {description && (
                <p className="mt-0.5 text-xs text-ink-soft">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-accent-soft hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Close panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">{children}</div>
        </div>
      </div>
    </div>
  );
};
