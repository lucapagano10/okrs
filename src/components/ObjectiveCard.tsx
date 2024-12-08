import React from 'react';
import { Objective, KeyResultStatus } from '../types/okr';
import { ProgressChart } from './ProgressChart';

interface ObjectiveCardProps {
  objective: Objective;
  onDelete: (id: string) => void;
  onEdit: () => void;
  onUpdateProgress: (objectiveId: string, keyResultId: string, currentValue: number) => void;
  isDarkMode?: boolean;
}

export const ObjectiveCard: React.FC<ObjectiveCardProps> = ({
  objective,
  onDelete,
  onEdit,
  onUpdateProgress,
  isDarkMode = false,
}) => {
  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDaysRemaining = (endDateStr: string) => {
    const today = new Date();
    const endDate = new Date(endDateStr);
    return Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getKeyResultStatus = (kr: { progress: number; endDate: string; currentValue: number; targetValue: number }): KeyResultStatus => {
    const daysRemaining = calculateDaysRemaining(kr.endDate);

    if (kr.currentValue >= kr.targetValue) {
      return 'completed';
    }

    if (daysRemaining < 0) {
      return 'overdue';
    }

    if (kr.progress >= 1) {
      return 'completed';
    }

    if (daysRemaining <= 7 && kr.progress < 0.8) {
      return 'at-risk';
    }

    if (kr.progress > 0) {
      return 'in-progress';
    }

    return 'not-started';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return isDarkMode ? 'bg-green-500' : 'bg-green-500';
    if (progress >= 50) return isDarkMode ? 'bg-blue-500' : 'bg-blue-500';
    if (progress >= 20) return isDarkMode ? 'bg-yellow-500' : 'bg-yellow-500';
    return isDarkMode ? 'bg-red-500' : 'bg-red-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return isDarkMode ? 'text-green-400' : 'text-green-600';
      case 'in-progress':
        return isDarkMode ? 'text-blue-400' : 'text-blue-600';
      case 'at-risk':
        return isDarkMode ? 'text-red-400' : 'text-red-600';
      case 'overdue':
        return isDarkMode ? 'text-orange-400' : 'text-orange-600';
      default:
        return isDarkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleProgressChange = (objectiveId: string, keyResultId: string, value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && keyResultId) {
      onUpdateProgress(objectiveId, keyResultId, numValue);
    }
  };

  return (
    <div className={`group rounded-xl transition-all duration-200 ${
      isDarkMode
        ? 'bg-gray-800/80 hover:bg-gray-800'
        : 'bg-gray-50 hover:bg-gray-100'
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-8 h-8 flex-shrink-0 mt-1">
              <ProgressChart
                progress={objective.progress}
                size={32}
                strokeWidth={2.5}
                isDarkMode={isDarkMode}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`text-sm font-medium truncate ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>{objective.title}</h3>
                {objective.category && (
                  <span className={`px-2 py-0.5 text-xs rounded-full whitespace-nowrap ${
                    isDarkMode
                      ? 'bg-gray-700/50 text-gray-300'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {objective.category}
                  </span>
                )}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {formatDateDisplay(objective.startDate)} - {formatDateDisplay(objective.endDate)}
              </div>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className={`p-1 rounded-lg transition-colors ${
                isDarkMode
                  ? 'hover:bg-gray-700/50 text-gray-500 hover:text-gray-300'
                  : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(objective.id)}
              className={`p-1 rounded-lg transition-colors ${
                isDarkMode
                  ? 'hover:bg-gray-700/50 text-gray-500 hover:text-red-400'
                  : 'hover:bg-gray-200 text-gray-500 hover:text-red-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {objective.keyResults.map(kr => {
            const krStatus = getKeyResultStatus(kr);
            const daysRemaining = calculateDaysRemaining(kr.endDate);

            return (
              <div key={kr.id} className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-700'
                      } truncate`}>{kr.description}</span>
                      <span className={`text-xs font-medium whitespace-nowrap ${getStatusColor(krStatus)}`}>
                        {formatStatus(krStatus)}
                      </span>
                    </div>
                    <div className="flex items-center mt-1 gap-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={kr.currentValue}
                          onChange={(e) => handleProgressChange(objective.id, kr.id || '', e.target.value)}
                          className={`w-14 px-1.5 py-0.5 text-xs border rounded ${
                            isDarkMode
                              ? 'bg-gray-800 border-gray-700 text-gray-200'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          min="0"
                          max={kr.targetValue}
                        />
                        <span className={`text-xs ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          /{kr.targetValue} {kr.unit}
                        </span>
                      </div>
                      <span className={`text-xs ${
                        daysRemaining < 0
                          ? isDarkMode ? 'text-red-400' : 'text-red-600'
                          : isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {daysRemaining < 0
                          ? `${Math.abs(daysRemaining)}d overdue`
                          : daysRemaining === 0
                          ? 'Due today'
                          : `${daysRemaining}d left`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`h-1 rounded-full overflow-hidden ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(kr.progress)}`}
                    style={{ width: `${kr.progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
