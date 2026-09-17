import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Inbox } from 'lucide-react';
import { ChangelogCard } from '../components/changelog/ChangelogCard';
import { ChangelogCardSkeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import api from '../services/api';

export const ChangelogDetail = () => {
  const { slug } = useParams();
  const [entry, setEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const fetchEntry = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get(`/changelog/${slug}`);
        if (res.data?.success) {
          setEntry(res.data.data);
        } else {
          setError('Product update not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load update');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchEntry();
    }
  }, [slug]);

  return (
    <div className="mx-auto max-w-[760px] space-y-8 px-5 py-10 sm:px-6 sm:py-14">
      {/* Back button */}
      <div>
        <Link to="/">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to All Releases
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <ChangelogCardSkeleton />
      ) : error || !entry ? (
          <div className="space-y-4 border border-line bg-white/40 px-4 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-cat-fixed/10 text-cat-fixed">
            <Inbox className="h-7 w-7" />
          </div>
          <h2 className="font-serif text-xl font-semibold text-ink">Release Not Found</h2>
          <p className="mx-auto max-w-sm text-xs text-ink-soft sm:text-sm">
            {error || 'The requested changelog entry does not exist or has been unpublished.'}
          </p>
          <Link to="/" className="inline-block">
            <Button variant="primary">Return to Release Timeline</Button>
          </Link>
        </div>
      ) : (
        <ChangelogCard
          entry={entry}
          isSingleView={true}
          onRequireAuth={() => setShowAuthModal(true)}
        />
      )}

      {/* Auth Prompt Modal */}
      <Dialog
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Join the Conversation"
        description="Sign in or create an account to react to product updates."
        maxWidth="max-w-md"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-center p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-3xl gap-4">
            <span>❤️</span>
            <span>🎉</span>
            <span>🚀</span>
          </div>

          <div className="flex flex-col gap-2.5">
            <Link to="/login" onClick={() => setShowAuthModal(false)}>
              <Button variant="primary" className="w-full">
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
