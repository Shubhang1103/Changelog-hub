import React from 'react';
import { Layers, Heart, Sparkles, Shield, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="mt-20 border-t border-line bg-paper text-xs text-ink-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-paper">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-slate-200 text-sm">Changelog & Product Updates Hub</p>
            <p className="text-slate-400 text-xs">Production MERN Stack • Headway & Beamer alternative</p>
          </div>
        </div>

        <div className="flex items-center gap-6 flex-wrap text-xs">
          <Link to="/" className="transition-colors hover:text-ink">
            Release Timeline
          </Link>
          <Link to="/widget-demo" className="transition-colors hover:text-ink">
            Widget Simulator
          </Link>
          <a
            href="/api/v1/changelog/feed"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent transition-colors hover:text-ink"
          >
            Public Feed (JSON)
          </a>
        </div>

        <div className="text-slate-400 text-xs text-center md:text-right">
          Built with React, Vite, Tailwind CSS, Node.js, Express & MongoDB
        </div>
      </div>
    </footer>
  );
};
