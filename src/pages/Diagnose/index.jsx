import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ScanSearch, AlertCircle, ChevronDown, ChevronUp, Link } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/ui/Button';
import ScoreRing from '../../components/ui/ScoreRing';
import { DiagnosticSkeleton } from '../../components/ui/Skeleton';
import useAppStore from '../../store/useAppStore';
import { runDiagnosis } from '../../lib/api';
import { parseAIJson, wordCount, getScoreColor, getSeverityColor } from '../../lib/utils';
import AboutFallbackResult from '../../components/ui/AboutFallbackResult';

const PRIORITY_COLORS = {
  critical: '#FF4D6D',
  important: '#F5A623',
  suggested: '#00D4FF',
};

function CategoryRow({ cat, index }) {
  const [expanded, setExpanded] = useState(false);
  const color = getSeverityColor(cat.status);
  const pct = cat.max_score > 0 ? (cat.score / cat.max_score) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-bg-hover transition-colors duration-120 text-left border-b border-border-subtle last:border-0"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-text-primary font-body">{cat.name}</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-body"
              style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}25` }}
            >
              {cat.status}
            </span>
          </div>
          {/* Score bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1 bg-border-subtle rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: index * 0.05 + 0.3, duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
            <span className="text-xs font-mono text-text-secondary whitespace-nowrap">
              {cat.score}/{cat.max_score}
            </span>
          </div>
        </div>
        <span className="text-text-muted flex-shrink-0">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 pb-4 bg-bg-elevated/30"
        >
          <p className="text-sm text-text-secondary font-body leading-relaxed mt-3">{cat.finding}</p>
          {cat.recommendation && (
            <div
              className="mt-3 p-3 rounded-lg text-sm font-body"
              style={{ backgroundColor: `${color}10`, border: `1px solid ${color}25`, color }}
            >
              <span className="font-medium">Fix: </span>{cat.recommendation}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function Diagnose() {
  const navigate = useNavigate();
  const currentPrompt = useAppStore((s) => s.currentPrompt);
  const setCurrentPrompt = useAppStore((s) => s.setCurrentPrompt);
  const hasAnyKey = useAppStore((s) => s.hasAnyKey());

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [diagPrompt, setDiagPrompt] = useState('');

  const handleDiagnose = useCallback(async () => {
    const p = diagPrompt || currentPrompt;
    if (!p.trim()) return;
    if (!hasAnyKey) {
      toast.error('No API keys configured. Please configure VITE_OR_KEY_1 and VITE_OR_KEY_2.');
      return;
    }
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const res = await runDiagnosis({ prompt: p });
      const text = res?.choices?.[0]?.message?.content || '';
      const parsed = parseAIJson(text);
      setResult(parsed);
    } catch (err) {
      setError(err.userMessage || err.message || 'Diagnosis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [diagPrompt, currentPrompt, hasAnyKey]);

  const activePrompt = diagPrompt || currentPrompt;

  return (
    <PageWrapper>
      <div className="content-max py-8 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 mb-5">
            <ScanSearch size={24} className="text-accent-cyan" />
          </div>
          <h1 className="font-display text-4xl font-bold text-text-primary mb-3">Diagnose your prompt.</h1>
          <p className="text-text-secondary font-body text-lg max-w-xl mx-auto">
            Get a full structural audit — no rewriting, just clarity on what&apos;s working and what isn&apos;t.
          </p>
        </div>

        {/* Input */}
        <div className="card p-5 space-y-4 mb-8">
          <textarea
            id="diagnose-input"
            data-prompt
            value={diagPrompt}
            onChange={(e) => setDiagPrompt(e.target.value)}
            placeholder={currentPrompt || 'Paste any prompt here to get a structural audit...'}
            className="w-full bg-bg-base border border-border-default rounded-lg p-4 font-mono text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 transition-all duration-150 outline-none resize-none leading-relaxed"
            style={{ minHeight: 240 }}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-mono">{wordCount(activePrompt)} words</span>
            {error && (
              <div className="flex items-center gap-1.5">
                <AlertCircle size={12} className="text-status-danger" />
                <span className="text-xs text-status-danger font-body">{error}</span>
              </div>
            )}
          </div>
          <Button
            id="diagnose-submit-btn"
            fullWidth
            size="lg"
            icon={ScanSearch}
            loading={isLoading}
            disabled={!activePrompt.trim() || isLoading}
            onClick={handleDiagnose}
          >
            {isLoading ? 'Analyzing...' : 'Run Diagnosis →'}
          </Button>
        </div>

        {/* Loading */}
        {isLoading && <DiagnosticSkeleton />}

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="card p-6 flex flex-col sm:flex-row items-center gap-6">
              <ScoreRing score={result.overall_score || 0} size={120} />
              <div className="flex-1 text-center sm:text-left">
                <h2 className="font-display text-xl font-bold text-text-primary mb-1">Prompt Diagnosis Report</h2>
                <p className="text-text-secondary text-sm font-body mb-3">
                  {new Date().toLocaleString()} &middot; {wordCount(activePrompt)} words
                </p>
                <p className="text-text-secondary text-sm font-body">
                  {(result.overall_score || 0) < 40
                    ? 'This prompt needs significant work before it will produce reliable AI outputs.'
                    : (result.overall_score || 0) < 70
                    ? 'This prompt has potential but is missing key structural elements.'
                    : (result.overall_score || 0) < 90
                    ? 'Solid prompt with room for improvement in a few areas.'
                    : 'Excellent prompt structure. Minor tweaks could make it perfect.'}
                </p>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-border-subtle">
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wider font-body">Category Breakdown</p>
              </div>
              {result.categories?.map((cat, i) => (
                <CategoryRow key={cat.name} cat={cat} index={i} />
              ))}
            </div>

            {/* Priority actions */}
            {result.priority_actions?.length > 0 && (
              <div className="card p-5 space-y-3">
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wider font-body mb-4">To improve this prompt, address these in order:</p>
                {result.priority_actions.map((action, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.2 }}
                    className="flex items-start gap-3 p-3 rounded-lg"
                    style={{
                      backgroundColor: `${PRIORITY_COLORS[action.priority]}10`,
                      border: `1px solid ${PRIORITY_COLORS[action.priority]}20`,
                    }}
                  >
                    <span
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded flex-shrink-0 mt-0.5"
                      style={{ color: PRIORITY_COLORS[action.priority] }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <span
                        className="text-xs font-medium uppercase mr-2"
                        style={{ color: PRIORITY_COLORS[action.priority] }}
                      >
                        [{action.priority}]
                      </span>
                      <span className="text-sm text-text-primary font-body">{action.action}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCurrentPrompt(activePrompt);
                        navigate('/improve');
                      }}
                      className="flex-shrink-0 text-xs"
                    >
                      Fix This →
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
            <AboutFallbackResult />
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
}
