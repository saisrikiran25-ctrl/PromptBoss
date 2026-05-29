// src/components/ui/ScoreRing.jsx
import { useEffect, useRef } from 'react';
import { getScoreColor } from '../../lib/utils';

export default function ScoreRing({ score = 0, size = 120, strokeWidth = 8 }) {
  const circleRef = useRef(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = getScoreColor(score);

  useEffect(() => {
    if (!circleRef.current) return;
    const offset = circumference - (score / 100) * circumference;
    circleRef.current.style.strokeDashoffset = circumference;
    // Trigger animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (circleRef.current) {
          circleRef.current.style.transition = 'stroke-dashoffset 1s ease-out';
          circleRef.current.style.strokeDashoffset = offset;
        }
      });
    });
  }, [score, circumference]);

  const label =
    score < 40 ? 'Poor' : score < 70 ? 'Needs Work' : score < 90 ? 'Good' : 'Excellent';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Score arc */}
          <circle
            ref={circleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display font-bold leading-none"
            style={{ fontSize: size * 0.25, color }}
          >
            {score}
          </span>
          <span className="text-text-muted font-body" style={{ fontSize: size * 0.09 }}>
            / 100
          </span>
        </div>
      </div>
      <span className="text-sm font-medium font-body" style={{ color }}>
        {label}
      </span>
    </div>
  );
}
