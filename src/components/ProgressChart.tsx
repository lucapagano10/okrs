import React from 'react';

interface ProgressChartProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  isDarkMode?: boolean;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  isDarkMode = false,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressOffset = circumference - (progress / 100) * circumference;

  const getProgressColor = (value: number) => {
    if (value >= 80) return isDarkMode ? '#22c55e' : '#16a34a';
    if (value >= 50) return isDarkMode ? '#3b82f6' : '#2563eb';
    if (value >= 20) return isDarkMode ? '#eab308' : '#ca8a04';
    return isDarkMode ? '#ef4444' : '#dc2626';
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          className={isDarkMode ? 'stroke-gray-700' : 'stroke-gray-200'}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: progressOffset,
            stroke: getProgressColor(progress),
            transition: 'stroke-dashoffset 0.5s ease',
          }}
          className="transition-colors duration-300"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
    </div>
  );
};
