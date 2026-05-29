// src/components/ui/Button.jsx
import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon: Icon,
    iconPosition = 'left',
    fullWidth = false,
    className = '',
    ...props
  },
  ref
) {
  const variants = {
    primary:
      'bg-accent-cyan text-bg-base hover:bg-accent-cyan-dim active:scale-[0.98] shadow-sm',
    ghost:
      'border border-border-default text-text-primary bg-transparent hover:border-border-accent hover:text-accent-cyan active:scale-[0.98]',
    subtle:
      'bg-bg-elevated text-text-secondary hover:text-text-primary hover:bg-bg-hover active:scale-[0.98]',
    danger:
      'bg-status-danger-dim text-status-danger border border-status-danger/30 hover:bg-status-danger hover:text-white active:scale-[0.98]',
    amber:
      'bg-accent-amber/10 text-accent-amber border border-accent-amber/30 hover:bg-accent-amber hover:text-bg-base active:scale-[0.98]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center font-body font-medium rounded-lg',
        'transition-all duration-150',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin flex-shrink-0" />}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon size={14} className="flex-shrink-0" />
      )}
      {children}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon size={14} className="flex-shrink-0" />
      )}
    </button>
  );
});

export default Button;
