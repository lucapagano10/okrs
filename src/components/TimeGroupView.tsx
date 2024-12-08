import React from 'react';
import { TimeGroup } from '../types/okr';
import { ObjectiveCard } from './ObjectiveCard';

interface TimeGroupViewProps {
  group: TimeGroup;
  onEdit: (objectiveId: string) => void;
  onDelete: (objectiveId: string) => void;
  onUpdateProgress: (objectiveId: string, keyResultId: string, currentValue: number) => void;
  isDarkMode?: boolean;
}

export const TimeGroupView: React.FC<TimeGroupViewProps> = ({
  group,
  onEdit,
  onDelete,
  onUpdateProgress,
  isDarkMode = false,
}) => {
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return isDarkMode ? 'bg-green-500' : 'bg-green-600';
    if (progress >= 50) return isDarkMode ? 'bg-blue-500' : 'bg-blue-600';
    if (progress >= 20) return isDarkMode ? 'bg-yellow-500' : 'bg-yellow-600';
    return isDarkMode ? 'bg-red-500' : 'bg-red-600';
  };

  const getStatusColor = (status: TimeGroup['status']) => {
    switch (status) {
      case 'current':
        return isDarkMode ? 'text-green-400' : 'text-green-600';
      case 'future':
        return isDarkMode ? 'text-blue-400' : 'text-blue-600';
      case 'past':
        return isDarkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className={`mb-12 rounded-xl border ${
      isDarkMode
        ? 'bg-gray-800/50 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {group.label}
              </h2>
              <div className={`text-sm mt-1 ${getStatusColor(group.status)}`}>
                {formatDate(group.startDate)} - {formatDate(group.endDate)}
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              group.status === 'current'
                ? isDarkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'
                : group.status === 'future'
                ? isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'
                : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-700'
            }`}>
              {group.status === 'current' ? 'Current' : group.status === 'future' ? 'Upcoming' : 'Past'}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(group.progress)}`}
                style={{ width: `${group.progress}%` }}
              />
            </div>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {group.progress.toFixed(0)}% Complete
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {group.objectives.map(objective => (
            <ObjectiveCard
              key={objective.id}
              objective={objective}
              onEdit={() => onEdit(objective.id)}
              onDelete={onDelete}
              onUpdateProgress={onUpdateProgress}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
