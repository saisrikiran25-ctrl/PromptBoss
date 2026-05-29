// src/hooks/useStream.js
import { useState, useRef, useCallback } from 'react';

/**
 * Hook for managing streaming text output with typewriter effect
 */
export function useStream() {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const bufferRef = useRef('');
  const rafRef = useRef(null);

  const reset = useCallback(() => {
    setText('');
    bufferRef.current = '';
    setIsStreaming(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const onChunk = useCallback((chunk) => {
    bufferRef.current += chunk;

    const flush = () => {
      if (bufferRef.current.length > 0) {
        // Take one character at a time for typewriter effect
        const char = bufferRef.current[0];
        bufferRef.current = bufferRef.current.slice(1);
        setText((prev) => prev + char);

        if (bufferRef.current.length > 0) {
          // Schedule next character with a minimum 18ms delay
          rafRef.current = setTimeout(flush, 18);
        }
      }
    };

    if (!rafRef.current || bufferRef.current.length === 1) {
      rafRef.current = setTimeout(flush, 18);
    }
  }, []);

  const startStream = useCallback(() => {
    reset();
    setIsStreaming(true);
  }, [reset]);

  const endStream = useCallback(() => {
    // Flush remaining buffer instantly
    if (bufferRef.current) {
      setText((prev) => prev + bufferRef.current);
      bufferRef.current = '';
    }
    setIsStreaming(false);
  }, []);

  return { text, isStreaming, onChunk, startStream, endStream, reset };
}
