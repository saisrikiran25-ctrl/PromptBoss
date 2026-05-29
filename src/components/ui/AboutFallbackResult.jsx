import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

export default function AboutFallbackResult() {
  const fallbackActive = useAppStore((s) => s.fallbackActive);
  const fallbackNote = useAppStore((s) => s.fallbackNote);
  const [open, setOpen] = useState(false);

  if (!fallbackActive || !fallbackNote) return null;

  return (
    <div className="card border border-status-warning/20 bg-status-warning-dim/5 rounded-xl overflow-hidden mt-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3.5 text-left text-xs font-body font-medium text-status-warning hover:bg-status-warning-dim/10 transition-colors duration-120"
        id="about-fallback-toggle-btn"
      >
        <span className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-status-warning" />
          <span>About this result (Offline Fallback Active)</span>
        </span>
        <span>{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-status-warning/10 text-xs text-text-secondary leading-relaxed font-body bg-bg-base/30">
          {fallbackNote}
        </div>
      )}
    </div>
  );
}
