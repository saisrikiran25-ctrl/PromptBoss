// src/components/ui/Badge.jsx
import { TASK_TYPES } from '../../constants/taskTypes';

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-bg-elevated text-text-secondary border border-border-subtle',
    cyan: 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20',
    amber: 'bg-accent-amber/10 text-accent-amber border border-accent-amber/20',
    success: 'bg-status-success/10 text-status-success border border-status-success/20',
    danger: 'bg-status-danger/10 text-status-danger border border-status-danger/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  };

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium font-body',
        variants[variant] || variants.default,
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}

export function TaskTypeBadge({ taskType, className = '' }) {
  const type = TASK_TYPES.find((t) => t.value === taskType) || TASK_TYPES[0];

  return (
    <span
      className={['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium font-body', className].join(' ')}
      style={{
        backgroundColor: `${type.color}18`,
        color: type.color,
        border: `1px solid ${type.color}30`,
      }}
    >
      {type.label}
    </span>
  );
}

export function ModelBadge({ model, className = '' }) {
  const providerColors = {
    anthropic: '#D97C4E',
    openai: '#10A37F',
    google: '#4285F4',
    'meta-llama': '#0866FF',
    mistralai: '#7C3AED',
  };

  const provider = model?.split('/')[0] || 'generic';
  const modelName = model?.split('/')[1]?.replace(/-/g, ' ') || model || 'Generic';
  const color = providerColors[provider] || '#8A9BAE';

  return (
    <span
      className={['inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-mono', className].join(' ')}
      style={{
        backgroundColor: `${color}15`,
        color: color,
        border: `1px solid ${color}25`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      {modelName}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  const map = {
    critical: { label: 'Critical', color: '#FF4D6D' },
    missing: { label: 'Missing', color: '#FF4D6D' },
    warning: { label: 'Weak', color: '#F5A623' },
    weak: { label: 'Weak', color: '#F5A623' },
    good: { label: 'Good', color: '#00C98D' },
  };
  const s = map[severity] || map.good;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium font-body"
      style={{
        backgroundColor: `${s.color}18`,
        color: s.color,
        border: `1px solid ${s.color}30`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {s.label}
    </span>
  );
}

export default Badge;
