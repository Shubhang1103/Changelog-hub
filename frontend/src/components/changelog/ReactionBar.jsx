import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const EMOJI_LIST = ['❤️', '🎉', '🚀'];

export const ReactionBar = ({
  changelogId,
  initialCounts = { '❤️': 0, '🎉': 0, '🚀': 0 },
  initialUserReactions = [],
  onRequireAuth,
}) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [counts, setCounts] = useState(initialCounts);
  const [userReactions, setUserReactions] = useState(initialUserReactions);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (emoji) => {
    if (!isAuthenticated) {
      if (onRequireAuth) {
        onRequireAuth();
      } else {
        toast.info('Please sign in or create an account to react to product updates.', 'Authentication Required');
      }
      return;
    }

    if (isUpdating) return;

    // Optimistic UI update
    const isReacted = userReactions.includes(emoji);
    const nextUserReactions = isReacted
      ? userReactions.filter((e) => e !== emoji)
      : [...userReactions, emoji];

    const nextCounts = {
      ...counts,
      [emoji]: Math.max(0, (counts[emoji] || 0) + (isReacted ? -1 : 1)),
    };

    setCounts(nextCounts);
    setUserReactions(nextUserReactions);
    setIsUpdating(true);

    try {
      const res = await api.post(`/changelog/${changelogId}/react`, { emoji });
      if (res.data?.success) {
        setCounts(res.data.counts || nextCounts);
        setUserReactions(res.data.userReactions || nextUserReactions);
      }
    } catch (err) {
      // Rollback on error
      setCounts(counts);
      setUserReactions(userReactions);
      toast.error('Failed to update reaction. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {EMOJI_LIST.map((emoji) => {
        const hasReacted = userReactions.includes(emoji);
        const count = counts[emoji] || 0;

        return (
          <button
            key={emoji}
            onClick={() => handleToggle(emoji)}
            className={`group inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent/50 active:scale-[0.98] ${
              hasReacted
                ? 'border-accent bg-accent-soft text-accent'
                : 'border-line bg-transparent text-ink-soft hover:border-ink-soft hover:text-ink'
            }`}
            title={
              isAuthenticated
                ? hasReacted
                  ? `Remove ${emoji} reaction`
                  : `React with ${emoji}`
                : 'Sign in to react'
            }
          >
            <span className="text-sm transition-transform duration-200 group-hover:scale-110">
              {emoji}
            </span>
            <span
              className={`font-mono text-xs ${
                hasReacted ? 'font-semibold text-accent' : 'text-ink-soft'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
