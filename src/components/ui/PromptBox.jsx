// src/components/ui/PromptBox.jsx
import { useState, useEffect, useRef } from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard, wordCount } from '../../lib/utils';

const VARIANT_STYLES = {
  quick: { border: '#00D4FF', label: 'Quick Version' },
  advanced: { border: '#A78BFA', label: 'Advanced Version' },
  system: { border: '#F5A623', label: 'System Prompt' },
  user: { border: '#34D399', label: 'User Template' },
  guardrails: { border: '#F472B6', label: 'Guardrails' },
  schema: { border: '#60A5FA', label: 'Output Schema' },
  default: { border: '#00D4FF', label: 'Prompt' },
};

export default function PromptBox({
  content = '',
  label,
  variant = 'default',
  showCopyButton = true,
  showWordCount = true,
  streaming = false,
  className = '',
  maxHeight = 400,
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isOverflow, setIsOverflow] = useState(false);
  const contentRef = useRef(null);
  const style = VARIANT_STYLES[variant] || VARIANT_STYLES.default;
  const displayLabel = label || style.label;

  useEffect(() => {
    if (contentRef.current) {
      setIsOverflow(contentRef.current.scrollHeight > maxHeight);
    }
  }, [content, maxHeight]);

  const handleCopy = async () => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy');
    }
  };

  if (!content) return null;

  return (
    <div
      className={['rounded-xl border border-border-subtle bg-bg-elevated overflow-hidden', className].join(' ')}
      style={{ borderLeft: `3px solid ${style.border}` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: style.border }}
          />
          <span className="text-xs font-medium text-text-secondary font-body uppercase tracking-wider">
            {displayLabel}
          </span>
          {streaming && (
            <span className="flex items-center gap-1 text-xs text-accent-cyan">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse-dot" />
              streaming
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {showWordCount && (
            <span className="text-xs text-text-muted font-mono">
              {wordCount(content)}w
            </span>
          )}
          {showCopyButton && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent-cyan transition-colors duration-120 px-2 py-1 rounded-md hover:bg-accent-cyan/10"
              title="Copy to clipboard"
              id="copy-prompt-btn"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-status-success" />
                  <span className="text-status-success">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="p-5 font-mono text-[13px] leading-7 text-text-primary overflow-y-auto whitespace-pre-wrap break-words"
        style={{ maxHeight: expanded ? 'none' : maxHeight }}
      >
        {content}
        {streaming && (
          <span className="inline-block w-0.5 h-4 bg-accent-cyan ml-0.5 animate-pulse" />
        )}
      </div>

      {/* Expand / collapse */}
      {isOverflow && !streaming && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-text-secondary hover:text-text-primary border-t border-border-subtle hover:bg-bg-hover transition-colors duration-120"
        >
          {expanded ? (
            <>
              <ChevronUp size={12} /> Show less
            </>
          ) : (
            <>
              <ChevronDown size={12} /> Show more
            </>
          )}
        </button>
      )}
    </div>
  );
}
