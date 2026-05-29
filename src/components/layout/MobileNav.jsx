// src/components/layout/MobileNav.jsx
import { Link, useLocation } from 'react-router-dom';
import { Home, Wand2, Workflow, ScanSearch, MoreHorizontal } from 'lucide-react';

const TABS = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/improve', icon: Wand2, label: 'Improve' },
  { to: '/workflow', icon: Workflow, label: 'Workflow' },
  { to: '/diagnose', icon: ScanSearch, label: 'Diagnose' },
  { to: '/settings', icon: MoreHorizontal, label: 'More' },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 mobile-nav border-t border-border-subtle"
      style={{ backdropFilter: 'blur(16px)', background: 'rgba(8,12,16,0.92)' }}
    >
      <div className="flex items-center justify-around py-3">
        {TABS.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-0.5 px-3 py-1"
            >
              <Icon
                size={20}
                className={isActive ? 'text-accent-cyan' : 'text-text-muted'}
              />
              <span
                className={[
                  'text-[10px] font-body font-medium',
                  isActive ? 'text-accent-cyan' : 'text-text-muted',
                ].join(' ')}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
