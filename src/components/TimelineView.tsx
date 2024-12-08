import React from 'react';
import { Objective } from '../types/okr';

interface TimelineViewProps {
  objectives: Objective[];
  isDarkMode?: boolean;
  onEditObjective: (objectiveId: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  objectives,
  isDarkMode = false,
  onEditObjective
}) => {
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

  const getPositionAndWidth = (startDate: Date, endDate: Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timelineStart = new Date(earliestDate);

    const startOffset = Math.ceil((start.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const left = (startOffset / timelineDuration) * 100;
    const width = (duration / timelineDuration) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Timeline View
      </h3>

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
              (new Date(latestDate).getTime() - new Date(earliestDate).getTime())) * 100}%`
          }}
        >
          <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`}>
            Today
          </div>
        </div>

        {/* Objectives */}
        <div className="space-y-4 pt-8">
          {sortedObjectives.map((objective) => {
            const { left, width } = getPositionAndWidth(objective.startDate, objective.endDate);
            return (
              <div
                key={objective.id}
                className="relative h-12 group"
                onClick={() => onEditObjective(objective.id)}
              >
                {/* Objective Bar */}
                <div
                  className={`absolute h-8 rounded-lg cursor-pointer transition-all ${
                    isDarkMode ? 'hover:ring-2 ring-gray-600' : 'hover:ring-2 ring-gray-200'
                  }`}
                  style={{ left, width }}
                >
                  {/* Progress Bar */}
                  <div
                    className={`h-full rounded-lg ${getProgressColor(objective.progress)}`}
                    style={{ width: `${objective.progress}%` }}
                  />

                  {/* Objective Title */}
                  <div className={`absolute inset-0 px-3 flex items-center ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <span className="text-sm font-medium truncate">
                      {objective.title}
                    </span>
                  </div>

                  {/* Tooltip */}
                  <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                    px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity
                    pointer-events-none whitespace-nowrap ${
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
