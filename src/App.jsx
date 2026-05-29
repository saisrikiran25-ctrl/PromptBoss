// src/App.jsx
import { Suspense, lazy, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import Navbar from './components/layout/Navbar';
import MobileNav from './components/layout/MobileNav';


// Lazy-loaded pages for code splitting
const Landing   = lazy(() => import('./pages/Landing'));
const Improve   = lazy(() => import('./pages/Improve'));
const Workflow  = lazy(() => import('./pages/Workflow'));
const Diagnose  = lazy(() => import('./pages/Diagnose'));
const History   = lazy(() => import('./pages/History'));
const Settings  = lazy(() => import('./pages/Settings'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin" />
        <span className="text-sm text-text-secondary font-body">Loading...</span>
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  // Keyboard shortcut: Cmd/Ctrl+K → focus textarea
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const textarea = document.querySelector('textarea[data-prompt]');
        if (textarea) textarea.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"          element={<Landing />} />
        <Route path="/improve"   element={<Improve />} />
        <Route path="/workflow"  element={<Workflow />} />
        <Route path="/diagnose"  element={<Diagnose />} />
        <Route path="/history"   element={<History />} />
        <Route path="/settings"  element={<Settings />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {

  return (
    <HashRouter>
      <div className="relative min-h-screen bg-bg-base">
        {/* Background grid + glow */}
        <div className="fixed inset-0 bg-grid opacity-50 pointer-events-none" />
        <div className="fixed inset-0 bg-radial-glow pointer-events-none" />

        <Navbar />
        <Suspense fallback={<PageLoader />}>
          <AnimatedRoutes />
        </Suspense>
        <MobileNav />

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0E1318',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#F0F4F8',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
            },
          }}
        />
      </div>
    </HashRouter>
  );
}
