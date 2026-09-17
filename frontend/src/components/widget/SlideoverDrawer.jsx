import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import { Sheet } from '../ui/Sheet';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { useNotifications } from '../../context/NotificationContext';

export const SlideoverDrawer = () => {
  const { isDrawerOpen, closeDrawer, recentUpdates, isLoading } = useNotifications();

  return (
    <Sheet
      isOpen={isDrawerOpen}
      onClose={closeDrawer}
      title="What's New"
      description="Latest product updates and feature releases"
      width="max-w-md"
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3 border-b border-line py-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        ) : recentUpdates.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Sparkles className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold text-ink">You're all caught up!</h4>
            <p className="text-xs text-ink-soft">No new product updates published recently.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentUpdates.map((item) => {
              const formattedDate = item.publishedAt
                ? new Date(item.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : '';

              // Clean plain-text excerpt
              const plainExcerpt = item.contentMarkdown
                ?.replace(/[#*`_~>[\]()]/g, '')
                ?.slice(0, 120)
                ?.trim();

              return (
                <div
                  key={item._id}
                  className="group relative border-b border-line py-4 transition-all duration-200"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-px flex-1 bg-line" />
                    <div className="flex items-center gap-2 bg-paper px-1 font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                      <span className={`h-1.5 w-1.5 rounded-full ${item.category === 'New' ? 'bg-cat-new' : item.category === 'Improved' ? 'bg-cat-improved' : 'bg-cat-fixed'}`} />
                      <span>{formattedDate.toUpperCase()}</span>
                    </div>
                    <div className="h-px flex-1 bg-line" />
                  </div>
                  <Badge variant={item.category} size="sm" dot>{item.category}</Badge>

                  <Link
                    to={`/changelog/${item.slug}`}
                    onClick={closeDrawer}
                    className="block font-serif text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-accent"
                  >
                    {item.title}
                  </Link>

                  {plainExcerpt && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-soft">
                      {plainExcerpt}...
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between pt-2.5">
                    <Link
                      to={`/changelog/${item.slug}`}
                      onClick={closeDrawer}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:text-ink"
                    >
                      <span>Read full update</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View full timeline link */}
        <div className="border-t border-line pt-4">
          <Link to="/" onClick={closeDrawer} className="block">
            <Button variant="secondary" className="w-full text-xs" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
              View Complete Release Timeline
            </Button>
          </Link>
        </div>
      </div>
    </Sheet>
  );
};
