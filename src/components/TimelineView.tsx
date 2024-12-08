import React, { useState } from 'react';
import { Objective } from '../types/okr';
import { ProgressChart } from './ProgressChart';

interface TimelineViewProps {
  objectives: Objective[];
  onObjectiveClick: (objectiveId: string) => void;
  isDarkMode?: boolean;
}

type ZoomLevel = 'month' | 'quarter' | 'year';

export const TimelineView: React.FC<TimelineViewProps> = ({
  objectives,
  onObjectiveClick,
  isDarkMode = false,
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

  const getStatusColor = (progress: number) => {
    if (progress >= 80) return isDarkMode ? 'text-green-400' : 'text-green-600';
    if (progress >= 50) return isDarkMode ? 'text-blue-400' : 'text-blue-600';
    if (progress >= 20) return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
    return isDarkMode ? 'text-red-400' : 'text-red-600';
  };

  const getPositionAndWidth = (startDate: string, endDate: string) => {
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

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Timeline View
        </h3>
        <div className="flex items-center gap-4">
          <div className={`flex rounded-lg overflow-hidden border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            {(['month', 'quarter', 'year'] as ZoomLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setZoomLevel(level)}
                className={`px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
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

      {/* Timeline Container */}
      <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-900/30' : 'bg-gray-50'}`}>
        {/* Timeline Header */}
        <div className="flex justify-between items-center mb-6 text-sm">
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            {formatDateDisplay(earliestDate instanceof Date ? earliestDate.toISOString() : earliestDate)}
          </span>
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            {formatDateDisplay(latestDate instanceof Date ? latestDate.toISOString() : latestDate)}
          </span>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Base Line */}
          <div className={`absolute top-8 left-0 right-0 h-px ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
          }`} />

          {/* Today Marker */}
          <div
            className={`absolute top-0 h-16 w-px ${isDarkMode ? 'bg-blue-500' : 'bg-blue-500'}`}
            style={{
              left: `${((new Date().getTime() - new Date(earliestDate).getTime()) /
                (new Date(latestDate).getTime() - new Date(earliestDate).getTime())) * 100}%`,
              zIndex: 20
            }}
          >
            <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-medium
              ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-500/10 text-blue-600'}`}
            >
              Today
            </div>
          </div>

          {/* Objectives */}
          <div className="space-y-3 pt-16">
            {sortedObjectives.map((objective) => {
              const { left, width, widthValue } = getPositionAndWidth(objective.startDate, objective.endDate);
              const daysRemaining = getDaysRemaining(objective.endDate);
              const isOverdue = daysRemaining < 0;

              return (
                <div
                  key={objective.id}
                  className="relative h-12 group"
                  onClick={() => onObjectiveClick(objective.id)}
                >
                  {/* Objective Bar */}
                  <div
                    className={`absolute h-10 cursor-pointer transition-all ${
                      isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    } rounded`}
                    style={{ left, width }}
                  >
                    {/* Objective Content */}
                    <div className={`h-full px-3 flex items-center justify-between ${
                      isDarkMode ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-6 h-6 flex-shrink-0">
                          <ProgressChart
                            progress={objective.progress}
                            size={24}
                            strokeWidth={2}
                            isDarkMode={isDarkMode}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate text-sm">
                            {objective.title}
                          </div>
                        </div>
                      </div>
                      {widthValue > 15 && (
                        <div className={`text-xs whitespace-nowrap ml-3 ${getStatusColor(objective.progress)}`}>
                          {isOverdue ? (
                            <span>{Math.abs(daysRemaining)}d overdue</span>
                          ) : (
                            <span>{daysRemaining}d left</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Tooltip */}
                    <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                      px-3 py-2 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity
                      pointer-events-none z-30 shadow-sm whitespace-nowrap
                      ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-600'}`}
                    >
                      <div className="font-medium text-sm mb-1">
                        {objective.title}
                      </div>
                      <div className="space-y-1">
                        <div>
                          {formatDateDisplay(objective.startDate)} - {formatDateDisplay(objective.endDate)}
                        </div>
                        <div>
                          {objective.keyResults.length} Key Results • {objective.progress}% Complete
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
