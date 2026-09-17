import React, { useState, useEffect, useCallback } from 'react';
import { LogIn, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChangelogCard } from '../components/changelog/ChangelogCard';
import { FilterBar } from '../components/changelog/FilterBar';
import { ChangelogCardSkeleton } from '../components/ui/Skeleton';
import { Dialog } from '../components/ui/Dialog';
import { Button } from '../components/ui/Button';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const PublicTimeline = () => {
  const { isAuthenticated } = useAuth();
  const [entries, setEntries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1, hasMore: false });
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 350);

  const fetchEntries = useCallback(async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pageNum);
      params.append('limit', 10);
      if (category !== 'All') {
        params.append('category', category);
      }
      if (debouncedSearch.trim()) {
        params.append('q', debouncedSearch.trim());
      }

      const res = await api.get(`/changelog?${params.toString()}`);
      if (res.data?.success) {
        setEntries(res.data.data || []);
        setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1, hasMore: false });
      }
    } catch (err) {
      console.error('Failed to load changelog timeline:', err);
    } finally {
      setIsLoading(false);
    }
  }, [category, debouncedSearch]);

  useEffect(() => {
    fetchEntries(1);
  }, [fetchEntries]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchEntries(newPage);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="mx-auto max-w-[760px] px-5 py-14 sm:px-6 sm:py-20">
      {/* Hero Header */}
    <div className="space-y-3 pb-12">
      <h1 className="font-serif text-5xl font-semibold leading-none tracking-tight text-ink sm:text-6xl">Changelog</h1>
      <p className="text-base text-ink-soft">Everything we've shipped, in order.</p>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        activeCategory={category}
        onCategoryChange={(newCat) => setCategory(newCat)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={pagination.total}
      />

      {/* Timeline Entries List */}
      <div className="space-y-8 relative">
        {isLoading ? (
          <div className="space-y-6">
            <ChangelogCardSkeleton />
            <ChangelogCardSkeleton />
          </div>
        ) : entries.length === 0 ? (
        <div className="space-y-4 border border-line bg-white/40 px-4 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Inbox className="h-7 w-7" />
            </div>
          <h3 className="text-lg font-semibold text-ink">No product updates found</h3>
          <p className="mx-auto max-w-sm text-xs text-ink-soft sm:text-sm">
              {searchQuery
                ? `No releases matching "${searchQuery}". Try adjusting your keywords or category filters.`
                : 'No published changelog entries are available for the selected category.'}
            </p>
            {(searchQuery || category !== 'All') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCategory('All');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          entries.map((entry) => (
            <ChangelogCard
              key={entry._id}
              entry={entry}
              onRequireAuth={() => setShowAuthModal(true)}
            />
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {!isLoading && pagination.totalPages > 1 && (
      <div className="flex items-center justify-between gap-4 pt-6 border-t border-line text-xs font-mono text-[10px] uppercase tracking-widest text-ink-soft">
          <div>
        Showing Page <span className="font-semibold text-ink">{pagination.page}</span> of{' '}
        <span className="font-semibold text-ink">{pagination.totalPages}</span> ({pagination.total} total)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!pagination.hasMore}
              onClick={() => handlePageChange(pagination.page + 1)}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Auth Prompt Modal */}
      <Dialog
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Join the Conversation"
        description="Sign in or create an account to react to product updates and personalize your notification stream."
        maxWidth="max-w-md"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-center gap-4 rounded-lg border border-line bg-accent-soft p-4 text-3xl">
            <span>❤️</span>
            <span>🎉</span>
            <span>🚀</span>
          </div>

          <div className="flex flex-col gap-2.5">
            <Link to="/login" onClick={() => setShowAuthModal(false)}>
              <Button variant="primary" className="w-full" leftIcon={<LogIn className="h-4 w-4" />}>
                Log In to React
              </Button>
            </Link>
            <Link to="/signup" onClick={() => setShowAuthModal(false)}>
              <Button variant="outline" className="w-full">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
