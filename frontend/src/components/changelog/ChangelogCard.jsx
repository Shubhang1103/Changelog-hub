import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Share2, Check, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ReactionBar } from './ReactionBar';
import { useToast } from '../../context/ToastContext';

export const ChangelogCard = ({
  entry,
  isSingleView = false,
  onRequireAuth,
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const formattedDate = entry.publishedAt
    ? new Date(entry.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).toUpperCase()
    : 'Unpublished';

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/changelog/${entry.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <article className="space-y-6">
      <div className="relative flex items-center gap-3 pt-1">
        <div className="h-px flex-1 bg-line" />
        <div className="flex items-center gap-2 bg-paper px-2 font-mono text-[10px] font-medium uppercase tracking-widest text-ink-soft">
          <span className={`h-1.5 w-1.5 rounded-full ${entry.category === 'New' ? 'bg-cat-new' : entry.category === 'Improved' ? 'bg-cat-improved' : 'bg-cat-fixed'}`} />
          <span>{formattedDate}</span>
        </div>
        <div className="h-px flex-1 bg-line" />
      </div>

      {/* Cover Image if available */}
      {entry.coverImage && (
        <div className="relative w-full overflow-hidden rounded-lg bg-ink max-h-80">
          <img
            src={entry.coverImage}
            alt={entry.title}
            className="w-full h-full object-cover max-h-80"
            loading="lazy"
            onError={(e) => {
              // Hide broken image quietly
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="space-y-5">
        {/* Meta Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant={entry.category} size="md" dot>
              {entry.category}
            </Badge>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1 text-xs text-ink-soft transition-colors hover:border-line hover:bg-white hover:text-ink"
            title="Share release link"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-semibold text-accent">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>

        {/* Title */}
        <div>
          {isSingleView ? (
            <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
              {entry.title}
            </h1>
          ) : (
            <Link
              to={`/changelog/${entry.slug}`}
              className="group inline-block"
            >
              <h2 className="font-serif text-2xl font-semibold leading-tight tracking-tight text-ink transition-colors group-hover:text-accent sm:text-3xl">
                {entry.title}
              </h2>
            </Link>
          )}
        </div>

        {/* Markdown Content */}
        <div className="pt-1">
          <MarkdownRenderer content={entry.contentMarkdown} />
        </div>

        {/* Footer: Reactions & Deep Link */}
        <div className="flex items-center justify-between gap-4 border-t border-line pt-5 flex-wrap">
          <ReactionBar
            changelogId={entry._id}
            initialCounts={entry.reactions || { '❤️': 0, '🎉': 0, '🚀': 0 }}
            initialUserReactions={entry.userReactions || []}
            onRequireAuth={onRequireAuth}
          />

          {!isSingleView && (
            <Link
              to={`/changelog/${entry.slug}`}
              className="group inline-flex items-center gap-1.5 text-xs font-semibold text-accent transition-colors hover:text-ink"
            >
              <span>Permanent Link</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};
