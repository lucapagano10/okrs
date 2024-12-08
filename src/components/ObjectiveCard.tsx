import React from 'react';
import { Objective, KeyResultStatus } from '../types/okr';
import { ProgressBar } from './ProgressBar';

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
      day: 'numeric',
      year: 'numeric'
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
    if (progress >= 80) return isDarkMode ? 'bg-green-500' : 'bg-green-600';
    if (progress >= 50) return isDarkMode ? 'bg-blue-500' : 'bg-blue-600';
    if (progress >= 20) return isDarkMode ? 'bg-yellow-500' : 'bg-yellow-600';
    return isDarkMode ? 'bg-red-500' : 'bg-red-600';
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

  return (
    <div className={`group rounded-xl shadow-sm border transition-all duration-200 ${
      isDarkMode
        ? 'bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-gray-800/50'
        : 'bg-white border-gray-100 hover:shadow-md hover:border-gray-200'
    }`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>{objective.title}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
              }`}>
                {objective.category}
              </span>
            </div>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>{objective.description}</p>
            <div className={`mt-2 text-xs ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              {formatDateDisplay(objective.startDate)} - {formatDateDisplay(objective.endDate)}
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className={`p-1 rounded-lg ${
                isDarkMode
                  ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
                  : 'text-gray-400 hover:text-blue-600 hover:bg-gray-50'
              }`}
              title="Edit Objective"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(objective.id)}
              className={`p-1 rounded-lg ${
                isDarkMode
                  ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
                  : 'text-gray-400 hover:text-red-600 hover:bg-gray-50'
              }`}
              title="Delete Objective"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-700'
            }`}>Overall Progress</span>
            <span className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-900'
            }`}>{objective.progress.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(objective.progress)}`}
              style={{ width: `${objective.progress}%` }}
            />
          </div>
        </div>

        <div className="mt-6">
          <h4 className={`text-sm font-medium mb-3 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-900'
          }`}>Key Results</h4>
          <ul className="space-y-4">
            {objective.keyResults.map(kr => {
              const krStatus = getKeyResultStatus(kr);
              const daysRemaining = calculateDaysRemaining(kr.endDate);

              return (
                <li key={kr.id} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`flex-1 text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>{kr.description}</span>
                        {krStatus && (
                          <span className={`text-xs font-medium ${getStatusColor(krStatus)}`}>
                            {formatStatus(krStatus)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center mt-1 gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={kr.currentValue}
                            onChange={(e) => onUpdateProgress(objective.id, kr.id, Number(e.target.value))}
                            className={`w-16 px-2 py-1 text-sm border rounded-md ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-gray-200'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            min="0"
                            max={kr.targetValue}
                          />
                          <span className={`font-medium text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-900'
                          }`}>
                            /{kr.targetValue} {kr.unit}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs ${
                            daysRemaining < 0
                              ? isDarkMode ? 'text-red-400' : 'text-red-600'
                              : isDarkMode ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            {daysRemaining < 0
                              ? `${Math.abs(daysRemaining)}d overdue`
                              : daysRemaining === 0
                              ? 'Due today'
                              : `${daysRemaining}d remaining`}
                          </span>
                          <span className={`text-xs ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            {formatDateDisplay(kr.startDate)} - {formatDateDisplay(kr.endDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getProgressColor(kr.progress)}`}
                      style={{ width: `${kr.progress}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
