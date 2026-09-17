import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Sparkles, Shield, LogOut, LogIn, UserPlus, AppWindow } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../widget/NotificationBell';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-paper/90 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-paper transition-transform group-hover:scale-105">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <span className="font-serif text-base font-semibold tracking-tight text-ink transition-colors group-hover:text-accent sm:text-lg">
                Changelog<span className="text-accent">Hub</span>
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-accent-soft hover:text-ink"
            >
              Timeline
            </Link>
            <Link
              to="/widget-demo"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-accent-soft hover:text-ink"
            >
              <AppWindow className="h-3.5 w-3.5 text-accent" />
              <span>Widget Demo</span>
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-paper"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Admin Studio</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <NotificationBell />

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-lg border border-line bg-white/50 px-3 py-1 sm:flex">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-paper">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="text-left">
                    <p className="max-w-[120px] truncate text-xs font-bold leading-none text-ink">
                    {user?.name}
                  </p>
                  <p className="mt-0.5 text-[10px] leading-none text-ink-soft">
                    {user?.role === 'admin' ? 'Admin' : 'Member'}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" leftIcon={<LogIn className="h-4 w-4" />}>
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm" leftIcon={<UserPlus className="h-4 w-4" />}>
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
