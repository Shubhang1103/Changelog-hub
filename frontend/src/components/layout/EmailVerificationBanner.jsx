import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const EmailVerificationBanner = () => {
  const { user, isAuthenticated, isEmailVerified, lastSimulatedEmail, verifyEmail } = useAuth();
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isAuthenticated || isEmailVerified || dismissed) {
    return null;
  }

  const handleSimulatedVerify = async () => {
    if (!lastSimulatedEmail?.token) {
      toast.info('Please check your server console for the simulated email verification link.');
      return;
    }

    setIsVerifying(true);
    try {
      await verifyEmail(lastSimulatedEmail.token);
      toast.success('Email verified successfully! You now have full verified status.');
    } catch (err) {
      toast.error('Failed to verify email with token.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="border-b border-cat-fixed/30 bg-cat-fixed/10 px-4 py-2.5 text-cat-fixed shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-200 animate-pulse" />
          <p className="truncate">
            <span className="font-bold">Verify your email:</span> We sent a verification link to{' '}
            <span className="underline font-mono">{user?.email}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {lastSimulatedEmail?.token && (
            <button
              onClick={handleSimulatedVerify}
              disabled={isVerifying}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cat-fixed/40 bg-paper px-3 py-1 text-xs font-semibold text-cat-fixed transition-colors hover:bg-cat-fixed hover:text-paper"
            >
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              <span>{isVerifying ? 'Verifying...' : 'Dev: 1-Click Verify'}</span>
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="rounded-lg p-1 text-cat-fixed transition-colors hover:bg-cat-fixed/10 hover:text-ink"
            title="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
