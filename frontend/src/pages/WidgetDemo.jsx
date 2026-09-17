import React, { useState } from 'react';
import {
  AppWindow,
  Bell,
  Code,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
  Shield,
  Activity,
  BarChart3,
  Users,
  Settings
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useNotifications } from '../context/NotificationContext';
import { useToast } from '../context/ToastContext';

export const WidgetDemo = () => {
  const { unreadCount, openDrawer } = useNotifications();
  const { toast } = useToast();
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const embedScript = `<!-- Changelog Hub Embeddable Slide-over Widget -->
<script
  src="${window.location.origin}/api/v1/changelog/feed"
  data-hub="changelog_hub_live"
  data-position="bottom-right"
  data-theme="dark"
  defer>
</script>`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(embedScript);
    setCopiedSnippet(true);
    toast.success('Widget embed code copied to clipboard!');
    setTimeout(() => setCopiedSnippet(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <AppWindow className="h-3.5 w-3.5" />
          <span>Interactive SaaS Integration Simulator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Embeddable "What's New" Widget
        </h1>
        <p className="max-w-xl mx-auto text-xs sm:text-sm text-slate-400">
          Experience how Changelog Hub delivers release notes directly inside a client application without forcing users away from their workflow.
        </p>
      </div>

      {/* Mock SaaS Product Frame */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Browser Mock Chrome */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-rose-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>

          <div className="flex-1 max-w-md bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-center text-xs font-mono text-slate-400 truncate">
            https://app.your-saas-company.com/dashboard
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="Published" size="sm">Widget Active</Badge>
          </div>
        </div>

        {/* Mock SaaS Header */}
        <div className="bg-slate-900/90 px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-paper text-sm font-bold">
              S
            </div>
            <span className="font-bold text-white text-sm">SaaSify Analytics Cloud</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Embedded Notification Bell Trigger */}
            <button
              onClick={openDrawer}
              className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 group"
              title="Click to test widget slide-over"
            >
              <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-slate-900 animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            <div className="h-8 w-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-200">
              JD
            </div>
          </div>
        </div>

        {/* Mock SaaS Body */}
        <div className="p-8 space-y-6 bg-slate-950/40 min-h-[360px] relative">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Monthly Active Workspaces</h2>
              <p className="text-xs text-slate-400">Real-time usage overview for current billing cycle</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={openDrawer}
              leftIcon={<Sparkles className="h-4 w-4" />}
            >
              Simulate Bell Click
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-slate-900/60 border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Total Revenue</span>
                <BarChart3 className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white">$48,290</p>
              <p className="text-[11px] text-emerald-400 font-semibold">+18.2% from last month</p>
            </Card>

            <Card className="p-4 bg-slate-900/60 border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Active Sessions</span>
                <Activity className="h-4 w-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-white">1,420</p>
              <p className="text-[11px] text-indigo-400 font-semibold">99.98% uptime</p>
            </Card>

            <Card className="p-4 bg-slate-900/60 border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Team Members</span>
                <Users className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-white">84 Seats</p>
              <p className="text-[11px] text-amber-400 font-semibold">3 invites pending</p>
            </Card>
          </div>

          {/* Floating Trigger in Mock Screen */}
          <div className="pt-8 flex justify-center">
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-center max-w-md space-y-2">
              <p className="text-xs text-indigo-300 font-bold">
                🎯 The notification bell at top-right has {unreadCount} unread update(s).
              </p>
              <p className="text-[11px] text-slate-400">
                Clicking either the bell icon or the button opens the slide-over drawer, automatically syncs the unread timestamp on the server, and marks everything as read.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Code Snippet */}
      <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Quick Integration Code</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopySnippet}
            leftIcon={copiedSnippet ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          >
            {copiedSnippet ? 'Copied' : 'Copy Snippet'}
          </Button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
          <code>{embedScript}</code>
        </pre>
      </Card>
    </div>
  );
};
