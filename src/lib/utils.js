// src/lib/utils.js

/**
 * Parse JSON from an AI response that may include markdown code fences
 */
export function parseAIJson(raw) {
  if (!raw) throw new Error('Empty response');

  // Strip markdown code fences if present
  const cleaned = raw
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```\s*$/m, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to extract JSON object from the string
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error('Could not parse AI response as JSON');
  }
}

/**
 * Format a date string into a human-readable relative time
 */
export function timeAgo(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * Count words in a string
 */
export function wordCount(str) {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Copy text to clipboard and return success boolean
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const success = document.execCommand('copy');
    document.body.removeChild(el);
    return success;
  }
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncate(str, maxLen = 100) {
  if (!str || str.length <= maxLen) return str;
  return str.slice(0, maxLen).trim() + '…';
}

/**
 * Get score color based on value
 */
export function getScoreColor(score) {
  if (score < 40) return '#FF4D6D';
  if (score < 70) return '#F5A623';
  if (score < 90) return '#00D4FF';
  return '#00C98D';
}

/**
 * Get severity color
 */
export function getSeverityColor(severity) {
  switch (severity) {
    case 'critical':
    case 'missing':
      return '#FF4D6D';
    case 'warning':
    case 'weak':
      return '#F5A623';
    case 'good':
      return '#00C98D';
    default:
      return '#8A9BAE';
  }
}

/**
 * Debounce function
 */
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Download text as a file
 */
export function downloadAsFile(content, filename, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export history as JSON
 */
export function exportHistoryAsJson(history) {
  const content = JSON.stringify(history, null, 2);
  downloadAsFile(content, 'promptboss-history.json', 'application/json');
}

/**
 * Export history as Markdown
 */
export function exportHistoryAsMarkdown(history) {
  const content = history
    .map(
      (h) =>
        `## ${h.taskType || 'Prompt'} — ${new Date(h.ts).toLocaleString()}\n\n**Original:**\n${h.original}\n\n**Improved:**\n${h.improved}\n\n---`
    )
    .join('\n\n');
  downloadAsFile(content, 'promptboss-history.md', 'text/markdown');
}

/**
 * Simulate streaming for instant JSON responses (so UI feels live and updates smoothly)
 */
export async function simulateStream(text, onChunk, intervalMs = 5) {
  const chunkSize = 80; // stream chunks of 80 characters to look like realistic fast token streaming
  let index = 0;
  while (index < text.length) {
    const chunk = text.slice(index, index + chunkSize);
    onChunk(chunk);
    index += chunkSize;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}
