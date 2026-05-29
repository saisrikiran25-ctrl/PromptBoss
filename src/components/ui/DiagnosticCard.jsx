// src/components/ui/DiagnosticCard.jsx
import { motion } from 'framer-motion';
import { SeverityBadge } from './Badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { getSeverityColor } from '../../lib/utils';

export default function DiagnosticCard({ category, severity, title, description, recommendation, index = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const color = getSeverityColor(severity);

  const dotColor = {
    critical: 'bg-status-danger',
    missing: 'bg-status-danger',
    warning: 'bg-accent-amber',
    weak: 'bg-accent-amber',
    good: 'bg-status-success',
  }[severity] || 'bg-text-muted';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: index * 0.06, ease: 'easeOut' }}
      className="card border border-border-subtle rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-bg-hover transition-colors duration-120"
      >
        <span className={`diagnostic-dot ${dotColor}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider font-body">
              {category}
            </span>
            <SeverityBadge severity={severity} />
          </div>
          <p className="text-sm text-text-primary mt-0.5 font-body">{title}</p>
        </div>
        <span className="text-text-muted flex-shrink-0 mt-0.5">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.18 }}
          className="px-4 pb-4 border-t border-border-subtle"
        >
          <p className="text-sm text-text-secondary leading-relaxed mt-3 font-body">{description}</p>
          {recommendation && (
            <div
              className="mt-3 p-3 rounded-lg text-sm font-body"
              style={{
                backgroundColor: `${color}10`,
                border: `1px solid ${color}25`,
                color: color,
              }}
            >
              <span className="font-medium">Recommendation: </span>
              {recommendation}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
