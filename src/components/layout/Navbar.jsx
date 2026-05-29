// src/components/layout/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { Settings, Zap } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const NAV_LINKS = [
  { to: '/improve', label: 'Improve' },
  { to: '/workflow', label: 'Workflow' },
  { to: '/diagnose', label: 'Diagnose' },
  { to: '/history', label: 'History' },
];

export default function Navbar() {
  const location = useLocation();
  const fallbackActive = useAppStore((s) => s.fallbackActive);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border-subtle"
      style={{ backdropFilter: 'blur(16px)', background: 'rgba(8,12,16,0.85)' }}
    >
      <nav className="content-max flex items-center justify-between h-14">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center group-hover:bg-accent-cyan/20 transition-colors duration-120">
            <Zap size={16} className="text-accent-cyan" />
          </div>
          <span className="font-display font-bold text-lg md:text-xl text-text-primary tracking-tight">
            Prompt<span className="text-accent-cyan">Boss</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={[
                  'px-3 py-1.5 rounded-lg text-sm font-medium font-body transition-all duration-120',
                  isActive
                    ? 'text-accent-cyan bg-accent-cyan/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated',
                ].join(' ')}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {fallbackActive && (
            <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full border border-status-warning/20 bg-status-warning-dim/5 text-status-warning text-xs font-body font-medium animate-pulse">
              ⚡ Offline Mode — Smart Fallback Active
            </span>
          )}
          <Link
            to="/settings"
            className={[
              'p-2 rounded-lg transition-all duration-120',
              location.pathname === '/settings'
                ? 'text-accent-cyan bg-accent-cyan/10'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated',
            ].join(' ')}
            title="Settings"
            id="settings-nav-btn"
          >
            <Settings size={16} />
          </Link>
        </div>
      </nav>
    </header>
  );
}
