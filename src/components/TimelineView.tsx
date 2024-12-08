import React, { useState } from 'react';
import { Objective } from '../types/okr';
import { ProgressChart } from './ProgressChart';

interface TimelineViewProps {
  objectives: Objective[];
  isDarkMode?: boolean;
  onEditObjective: (objectiveId: string) => void;
}

type ZoomLevel = 'month' | 'quarter' | 'year';

export const TimelineView: React.FC<TimelineViewProps> = ({
  objectives,
  isDarkMode = false,
  onEditObjective
}) => {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('quarter');

  // Sort objectives by start date
  const sortedObjectives = [...objectives].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  // Find the earliest and latest dates
  const earliestDate = sortedObjectives[0]?.startDate || new Date();
  const latestDate = sortedObjectives[sortedObjectives.length - 1]?.endDate || new Date();

  // Calculate total timeline duration in days
  const timelineDuration = Math.ceil(
    (new Date(latestDate).getTime() - new Date(earliestDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return isDarkMode ? 'bg-green-500' : 'bg-green-600';
    if (progress >= 50) return isDarkMode ? 'bg-blue-500' : 'bg-blue-600';
    if (progress >= 20) return isDarkMode ? 'bg-yellow-500' : 'bg-yellow-600';
    return isDarkMode ? 'bg-red-500' : 'bg-red-600';
  };

  const getStatusColor = (progress: number) => {
    if (progress >= 80) return isDarkMode ? 'text-green-400' : 'text-green-700';
    if (progress >= 50) return isDarkMode ? 'text-blue-400' : 'text-blue-700';
    if (progress >= 20) return isDarkMode ? 'text-yellow-400' : 'text-yellow-700';
    return isDarkMode ? 'text-red-400' : 'text-red-700';
  };

  const getPositionAndWidth = (startDate: Date, endDate: Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timelineStart = new Date(earliestDate);

    const startOffset = Math.ceil((start.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const leftPercent = (startOffset / timelineDuration) * 100;
    const widthPercent = (duration / timelineDuration) * 100;

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
      widthValue: widthPercent
    };
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: Date) => {
    const today = new Date();
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Timeline View
        </h3>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Zoom:</span>
          <div className={`flex rounded-lg overflow-hidden border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            {(['month', 'quarter', 'year'] as ZoomLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setZoomLevel(level)}
                className={`px-3 py-1 text-sm font-medium capitalize transition-colors ${
                  zoomLevel === level
                    ? isDarkMode
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-gray-900'
                    : isDarkMode
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Header */}
      <div className="flex justify-between mb-2">
        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {formatDate(earliestDate)}
        </span>
        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {formatDate(latestDate)}
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Base Line */}
        <div className={`absolute top-4 left-0 right-0 h-0.5 ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`} />

        {/* Today Marker */}
        <div
          className={`absolute top-0 h-8 w-0.5 ${isDarkMode ? 'bg-blue-500' : 'bg-blue-600'}`}
          style={{
            left: `${((new Date().getTime() - new Date(earliestDate).getTime()) /
              (new Date(latestDate).getTime() - new Date(earliestDate).getTime())) * 100}%`,
            zIndex: 10
          }}
        >
          <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`}>
            Today
          </div>
        </div>

        {/* Objectives */}
        <div className="space-y-6 pt-8">
          {sortedObjectives.map((objective) => {
            const { left, width, widthValue } = getPositionAndWidth(objective.startDate, objective.endDate);
            const daysRemaining = getDaysRemaining(objective.endDate);
            const isOverdue = daysRemaining < 0;

            return (
              <div
                key={objective.id}
                className="relative h-16 group"
                onClick={() => onEditObjective(objective.id)}
              >
                {/* Objective Bar */}
                <div
                  className={`absolute h-12 rounded-lg cursor-pointer transition-all ${
                    isDarkMode ? 'hover:ring-2 ring-gray-600' : 'hover:ring-2 ring-gray-200'
                  }`}
                  style={{ left, width }}
                >
                  {/* Progress Bar */}
                  <div
                    className={`h-full rounded-lg ${getProgressColor(objective.progress)} transition-all`}
                    style={{ width: `${objective.progress}%` }}
                  />

                  {/* Objective Content */}
                  <div className={`absolute inset-0 px-4 flex items-center justify-between ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 flex-shrink-0">
                        <ProgressChart
                          progress={objective.progress}
                          size={32}
                          strokeWidth={3}
                          isDarkMode={isDarkMode}
                        />
                      </div>
                      <div>
                        <div className="font-medium truncate">
                          {objective.title}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {objective.keyResults.length} Key Results
                        </div>
                      </div>
                    </div>
                    {widthValue > 15 && (
                      <div className={`text-sm ${getStatusColor(objective.progress)}`}>
                        {isOverdue ? (
                          <span className={isDarkMode ? 'text-red-400' : 'text-red-600'}>
                            {Math.abs(daysRemaining)}d overdue
                          </span>
                        ) : (
                          `${daysRemaining}d remaining`
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tooltip */}
                  <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                    px-4 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity
                    pointer-events-none z-20 ${
                      isDarkMode
                        ? 'bg-gray-700 text-white'
                        : 'bg-white text-gray-900 shadow-lg'
                    }`}
                  >
                    <div className="font-medium">{objective.title}</div>
                    <div className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      {formatDate(objective.startDate)} - {formatDate(objective.endDate)}
                    </div>
                    <div className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      Progress: {objective.progress}%
                    </div>
                    <div className="mt-1 space-y-1">
                      {objective.keyResults.map((kr, index) => (
                        <div key={kr.id} className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          • KR{index + 1}: {kr.description} ({kr.progress}%)
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
