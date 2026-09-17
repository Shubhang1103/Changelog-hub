import React from 'react';
import { Search, Rss, X } from 'lucide-react';
import { Input } from '../ui/Input';

const CATEGORIES = [
  { id: 'All', label: 'All Updates' },
  { id: 'New', label: 'New' },
  { id: 'Improved', label: 'Improved' },
  { id: 'Fixed', label: 'Fixed' },
];

export const FilterBar = ({
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  totalCount,
}) => {
  return (
    <div className="flex flex-col items-stretch justify-between gap-4 border-b border-line pb-4 md:flex-row md:items-center">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 font-mono text-[10px] font-medium uppercase tracking-widest whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent ${
                isActive
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-line bg-transparent text-ink-soft hover:border-ink-soft hover:text-ink'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Input & Feed Link */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 md:w-64">
          <Input
            placeholder="Search updates..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            rightIcon={
              searchQuery ? (
                <button
                  onClick={() => onSearchChange('')}
                  className="text-ink-soft transition-colors hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null
            }
            className="text-xs !py-2"
          />
        </div>

        <a
          href="/api/v1/changelog/feed"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-transparent px-3 py-2 font-mono text-[10px] font-medium uppercase tracking-widest text-ink-soft transition-colors hover:border-ink-soft hover:text-ink"
          title="Open Public JSON Feed"
        >
          <Rss className="h-3.5 w-3.5 text-accent" />
          <span className="hidden sm:inline">JSON Feed</span>
        </a>
      </div>
    </div>
  );
};
