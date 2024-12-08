import { useState, useEffect } from 'react';

interface ProgressBarProps {
  progress: number;
  isDarkMode?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  isDarkMode = false,
}) => {
  const [width, setWidth] = useState('0%');
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  useEffect(() => {
    // Add a small delay for animation
    const timer = setTimeout(() => {
      setWidth(`${clampedProgress}%`);
    }, 100);
    return () => clearTimeout(timer);
  }, [clampedProgress]);

  const getProgressColor = (value: number) => {
    if (value >= 80) return isDarkMode ? 'bg-green-500' : 'bg-green-500';
    if (value >= 50) return isDarkMode ? 'bg-blue-500' : 'bg-blue-500';
    if (value >= 20) return isDarkMode ? 'bg-yellow-500' : 'bg-yellow-500';
    return isDarkMode ? 'bg-red-500' : 'bg-red-500';
  };

  return (
    <div className={`w-full h-1.5 rounded-full overflow-hidden ${
      isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
    }`}>
      <div
        className={`h-full ${getProgressColor(clampedProgress)} transition-all duration-500 ease-out`}
        style={{ width }}
      />
    </div>
  );
};
