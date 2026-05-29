import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Search, Trash2, Copy, RotateCcw, Eye, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/ui/Button';
import { TaskTypeBadge, ModelBadge } from '../../components/ui/Badge';
import useAppStore from '../../store/useAppStore';
import { copyToClipboard, timeAgo, truncate, exportHistoryAsJson, exportHistoryAsMarkdown } from '../../lib/utils';
import { TASK_TYPES } from '../../constants/taskTypes';

const MODE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'improve', label: 'Improver' },
  { value: 'workflow', label: 'Workflow' },
  { value: 'diagnosis', label: 'Diagnosis' },
];

const DATE_FILTERS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: 'all', label: 'All time' },
];

function HistoryCard({ entry, onDelete, onRerun, onCopy }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="card border border-border-subtle rounded-xl overflow-hidden hover:border-border-default transition-colors duration-150"
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <TaskTypeBadge taskType={entry.taskType} />
            {entry.model && <ModelBadge model={entry.model} />}
            <span className="text-xs text-text-muted font-body flex items-center gap-1">
              <Clock size={10} />{timeAgo(entry.ts)}
            </span>
          </div>
        </div>

        {/* Original prompt */}
        <div className="mb-2">
          <p className="text-xs text-text-muted font-body mb-1 uppercase tracking-wider">Original</p>
          <p className="text-sm text-text-secondary font-mono leading-relaxed">
            {truncate(entry.original, 140)}
          </p>
        </div>

        <div className="border-t border-border-subtle my-3" />

        {/* Improved prompt */}
        {entry.improved && (
          <div className="mb-3">
            <p className="text-xs text-text-muted font-body mb-1 uppercase tracking-wider">Improved</p>
            <p className="text-sm text-text-primary font-mono leading-relaxed" style={{ borderLeft: '2px solid #00D4FF', paddingLeft: '12px' }}>
              {expanded ? entry.improved : truncate(entry.improved, 160)}
            </p>
            {entry.improved.length > 160 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-accent-cyan mt-1 hover:underline font-body"
              >
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" size="sm" icon={Eye} onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Collapse' : 'View Full'}
          </Button>
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={() => onRerun(entry)}>
            Re-run
          </Button>
          <Button variant="ghost" size="sm" icon={Copy} onClick={() => onCopy(entry.improved)}>
            Copy Improved
          </Button>
          <Button variant="danger" size="sm" icon={Trash2} onClick={() => onDelete(entry.id)} />
        </div>
      </div>
    </motion.div>
  );
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const history = useAppStore((s) => s.history);
  const deleteFromHistory = useAppStore((s) => s.deleteFromHistory);
  const clearHistory = useAppStore((s) => s.clearHistory);
  const setCurrentPrompt = useAppStore((s) => s.setCurrentPrompt);

  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('all');
  const [taskFilter, setTaskFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filtered = useMemo(() => {
    let items = history;
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (h) =>
          h.original?.toLowerCase().includes(q) ||
          h.improved?.toLowerCase().includes(q)
      );
    }
    if (modeFilter !== 'all') items = items.filter((h) => h.type === modeFilter);
    if (taskFilter !== 'all') items = items.filter((h) => h.taskType === taskFilter);
    if (dateFilter !== 'all') {
      const cutoff = Date.now() - parseInt(dateFilter) * 24 * 3600 * 1000;
      items = items.filter((h) => new Date(h.ts).getTime() > cutoff);
    }
    return items;
  }, [history, search, modeFilter, taskFilter, dateFilter]);

  const handleDelete = (id) => {
    deleteFromHistory(id);
    toast.success('Entry deleted');
  };

  const handleRerun = (entry) => {
    setCurrentPrompt(entry.original);
    navigate(entry.type === 'workflow' ? '/workflow' : '/improve');
  };

  const handleCopy = async (text) => {
    await copyToClipboard(text);
    toast.success('Copied to clipboard');
  };

  const handleClear = () => {
    clearHistory();
    setShowClearConfirm(false);
    toast.success('History cleared');
  };

  return (
    <PageWrapper>
      <div className="content-max py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-text-primary mb-1">History</h1>
            <p className="text-text-secondary font-body text-sm">{history.length} saved improvements</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => exportHistoryAsJson(history)}>Export JSON</Button>
            <Button variant="ghost" size="sm" onClick={() => exportHistoryAsMarkdown(history)}>Export Markdown</Button>
            {history.length > 0 && (
              <Button variant="danger" size="sm" icon={Trash2} onClick={() => setShowClearConfirm(true)}>Clear All</Button>
            )}
          </div>
        </div>

        {/* Clear confirm modal */}
        <AnimatePresence>
          {showClearConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="card p-6 max-w-sm w-full rounded-2xl border border-status-danger/20"
              >
                <h3 className="font-display text-lg font-bold text-text-primary mb-2">Clear all history?</h3>
                <p className="text-text-secondary text-sm font-body mb-5">This permanently deletes all {history.length} saved entries. This cannot be undone.</p>
                <div className="flex gap-3">
                  <Button variant="ghost" fullWidth onClick={() => setShowClearConfirm(false)}>Cancel</Button>
                  <Button variant="danger" fullWidth onClick={handleClear}>Yes, Clear All</Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar filters */}
          <div className="space-y-5">
            <div className="card p-4 space-y-2">
              <label className="label" htmlFor="history-search">Search</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  id="history-search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search history..."
                  className="input-field pl-8 text-sm"
                />
              </div>
            </div>

            <div className="card p-4 space-y-2">
              <p className="label">Mode</p>
              <div className="space-y-1">
                {MODE_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setModeFilter(f.value)}
                    className={['w-full text-left px-3 py-2 rounded-lg text-sm font-body transition-colors duration-120', modeFilter === f.value ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'].join(' ')}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-4 space-y-2">
              <p className="label">Task Type</p>
              <select
                value={taskFilter}
                onChange={(e) => setTaskFilter(e.target.value)}
                className="select-field text-sm"
              >
                <option value="all">All Types</option>
                {TASK_TYPES.filter(t => t.value !== 'auto').map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="card p-4 space-y-2">
              <p className="label">Date Range</p>
              <div className="space-y-1">
                {DATE_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setDateFilter(f.value)}
                    className={['w-full text-left px-3 py-2 rounded-lg text-sm font-body transition-colors duration-120', dateFilter === f.value ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'].join(' ')}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* History list */}
          <div className="md:col-span-3 space-y-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-14 h-14 rounded-2xl bg-bg-elevated flex items-center justify-center mb-4">
                  <History size={24} className="text-text-muted" />
                </div>
                <h3 className="font-display text-xl font-bold text-text-primary mb-2">
                  {history.length === 0 ? 'No history yet' : 'No results found'}
                </h3>
                <p className="text-text-secondary text-sm font-body max-w-xs">
                  {history.length === 0
                    ? 'Start by improving a prompt. Your work will appear here.'
                    : 'Try adjusting your search or filters.'}
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {filtered.map((entry) => (
                  <HistoryCard
                    key={entry.id}
                    entry={entry}
                    onDelete={handleDelete}
                    onRerun={handleRerun}
                    onCopy={handleCopy}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
