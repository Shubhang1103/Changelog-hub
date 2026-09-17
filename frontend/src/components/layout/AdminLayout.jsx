import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Shield, ArrowLeft, PlusCircle, LayoutDashboard, Sparkles, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const AdminLayout = () => {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-ink-soft">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span className="text-sm font-semibold">Authenticating admin session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper p-4">
        <div className="w-full max-w-md space-y-4 rounded-lg border border-cat-fixed/30 bg-white/50 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-cat-fixed/10 text-cat-fixed">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-ink">403 — Admin Access Required</h2>
          <p className="text-xs text-ink-soft">
            Your account ({user?.email}) does not have administrative privileges to access the Publishing Studio.
          </p>
          <Link to="/" className="inline-block">
            <Button variant="primary" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Public Changelog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper font-sans text-ink">
      {/* Admin Studio Top Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-line bg-paper px-4 py-3 backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-ink-soft transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Live Timeline</span>
          </Link>
          <div className="h-4 w-px bg-line" />
          <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-ink">
              Publishing<span className="text-accent">Studio</span>
            </span>
            <Badge variant="admin" size="sm">Admin</Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin">
            <Button
              variant={location.pathname === '/admin' ? 'primary' : 'outline'}
              size="sm"
              leftIcon={<LayoutDashboard className="h-3.5 w-3.5" />}
            >
              All Releases
            </Button>
          </Link>
          <Link to="/admin/new">
            <Button
              variant={location.pathname === '/admin/new' ? 'primary' : 'secondary'}
              size="sm"
              leftIcon={<PlusCircle className="h-3.5 w-3.5" />}
            >
              New Release
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </div>
    </div>
  );
};
