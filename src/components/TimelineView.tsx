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

  const getBackgroundColor = (progress: number) => {
    if (progress >= 80) return isDarkMode ? 'bg-green-500/10' : 'bg-green-50';
    if (progress >= 50) return isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50';
    if (progress >= 20) return isDarkMode ? 'bg-yellow-500/10' : 'bg-yellow-50';
    return isDarkMode ? 'bg-red-500/10' : 'bg-red-50';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return isDarkMode ? 'bg-green-500/20' : 'bg-green-500/20';
    if (progress >= 50) return isDarkMode ? 'bg-blue-500/20' : 'bg-blue-500/20';
    if (progress >= 20) return isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-500/20';
    return isDarkMode ? 'bg-red-500/20' : 'bg-red-500/20';
  };

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
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Zoom:</span>
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
      <div className={`rounded-xl p-8 ${isDarkMode ? 'bg-gray-900/30' : 'bg-gray-50'}`}>
        {/* Timeline Header */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <div className={`px-4 py-2 rounded-lg ${
                isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'
              } shadow-sm flex items-center gap-2`}>
                <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Start: {formatDateDisplay(earliestDate instanceof Date ? earliestDate.toISOString() : earliestDate)}
                </span>
              </div>
              <div className={`px-4 py-2 rounded-lg ${
                isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'
              } shadow-sm flex items-center gap-2`}>
                <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  End: {formatDateDisplay(latestDate instanceof Date ? latestDate.toISOString() : latestDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline Base Line */}
            <div className={`absolute top-8 left-0 right-0 h-0.5 ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
            }`} />

            {/* Today Marker */}
            <div
              className={`absolute top-0 h-16 w-0.5 ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'}`}
              style={{
                left: `${((new Date().getTime() - new Date(earliestDate).getTime()) /
                  (new Date(latestDate).getTime() - new Date(earliestDate).getTime())) * 100}%`,
                zIndex: 20
              }}
            >
              <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 px-3 py-1.5 rounded-lg text-xs font-medium
                ${isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-500/10 text-blue-600'}
                flex items-center gap-1.5`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Today
              </div>
            </div>

            {/* Objectives */}
            <div className="space-y-4 pt-16">
              {sortedObjectives.map((objective) => {
                const { left, width, widthValue } = getPositionAndWidth(objective.startDate, objective.endDate);
                const daysRemaining = getDaysRemaining(objective.endDate);
                const isOverdue = daysRemaining < 0;

                return (
                  <div
                    key={objective.id}
                    className="relative h-16 group"
                    onClick={() => onObjectiveClick(objective.id)}
                  >
                    {/* Objective Bar */}
                    <div
                      className={`absolute h-14 rounded-lg cursor-pointer transition-all shadow-sm
                        ${getBackgroundColor(objective.progress)}
                        ${isDarkMode ? 'hover:ring-1 ring-gray-700' : 'hover:ring-1 ring-gray-300'}
                        hover:translate-y-[-1px] hover:shadow-md transition-all duration-200`}
                      style={{ left, width }}
                    >
                      {/* Progress Bar */}
                      <div
                        className={`h-full rounded-lg ${getProgressColor(objective.progress)} transition-all duration-300`}
                        style={{ width: `${objective.progress}%` }}
                      />

                      {/* Objective Content */}
                      <div className={`absolute inset-0 px-4 flex items-center justify-between ${
                        isDarkMode ? 'text-gray-100' : 'text-gray-900'
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
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {objective.title}
                            </div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {objective.keyResults.length} Key Results
                            </div>
                          </div>
                        </div>
                        {widthValue > 15 && (
                          <div className={`text-sm whitespace-nowrap ml-4 font-medium ${getStatusColor(objective.progress)}`}>
                            {isOverdue ? (
                              <span className={`${isDarkMode ? 'text-red-400' : 'text-red-600'} flex items-center gap-1`}>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {Math.abs(daysRemaining)}d overdue
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {daysRemaining}d remaining
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Tooltip */}
                      <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                        px-4 py-3 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity
                        pointer-events-none z-30 shadow-lg ${
                          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                        }`}
                      >
                        <div className="font-medium">{objective.title}</div>
                        <div className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                          {formatDateDisplay(objective.startDate)} - {formatDateDisplay(objective.endDate)}
                        </div>
                        <div className="mt-2 space-y-1.5">
                          {objective.keyResults.map((kr) => (
                            <div key={kr.id} className={`text-xs ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              • {kr.description}
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
      </div>
    </div>
  );
};
