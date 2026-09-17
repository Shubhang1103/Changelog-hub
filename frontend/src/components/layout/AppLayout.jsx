import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { EmailVerificationBanner } from './EmailVerificationBanner';
import { SlideoverDrawer } from '../widget/SlideoverDrawer';

export const AppLayout = () => {
  return (
    <div className="relative flex min-h-screen flex-col bg-paper text-ink selection:bg-accent selection:text-paper">
      <EmailVerificationBanner />
      <Navbar />

      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      <Footer />
      <SlideoverDrawer />
    </div>
  );
};
