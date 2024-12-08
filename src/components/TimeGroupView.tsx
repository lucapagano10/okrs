import React from 'react';
import { TimeGroup } from '../types/okr';
import { ObjectiveCard } from './ObjectiveCard';
import { ProgressChart } from './ProgressChart';

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
  const getStatusBadgeColor = (status: TimeGroup['status']) => {
    switch (status) {
      case 'current':
        return isDarkMode
          ? 'bg-green-500/5 text-green-400 ring-1 ring-green-500/10'
          : 'bg-green-50 text-green-700 ring-1 ring-green-600/20';
      case 'future':
        return isDarkMode
          ? 'bg-blue-500/5 text-blue-400 ring-1 ring-blue-500/10'
          : 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20';
      case 'past':
        return isDarkMode
          ? 'bg-gray-500/5 text-gray-400 ring-1 ring-gray-500/10'
          : 'bg-gray-100 text-gray-600 ring-1 ring-gray-500/20';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className={`mb-8 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl overflow-hidden`}>
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12">
              <ProgressChart
                progress={group.progress}
                size={48}
                strokeWidth={3}
                isDarkMode={isDarkMode}
              />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {group.label}
                </h2>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(group.status)}`}>
                  {group.status === 'current' ? 'Current' : group.status === 'future' ? 'Upcoming' : 'Past'}
                </span>
              </div>
              <div className={`text-sm mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {formatDate(group.startDate)} - {formatDate(group.endDate)}
              </div>
            </div>
          </div>
          <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {group.objectives.length} Objective{group.objectives.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className={`px-4 pb-4 ${isDarkMode ? 'bg-gray-900/30' : 'bg-white'}`}>
        <div className="grid grid-cols-1 gap-3">
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
