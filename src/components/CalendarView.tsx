import React, { useState } from 'react';
import { Objective } from '../types/okr';
import { ProgressChart } from './ProgressChart';

interface CalendarViewProps {
  objectives: Objective[];
  isDarkMode?: boolean;
  onEditObjective: (objectiveId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  objectives,
  isDarkMode = false,
  onEditObjective
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthData = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = Array(daysInMonth).fill(0).map((_, i) => i + 1);
    const blanks = Array(firstDayOfMonth).fill(null);
    return [...blanks, ...days];
  };

  const getObjectivesForDay = (day: number) => {
    if (!day) return [];
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return objectives.filter(obj => {
      const start = new Date(obj.startDate);
      const end = new Date(obj.endDate);
      return date >= start && date <= end;
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return isDarkMode ? 'bg-green-500/20' : 'bg-green-100';
    if (progress >= 50) return isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100';
    if (progress >= 20) return isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100';
    return isDarkMode ? 'bg-red-500/20' : 'bg-red-100';
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Calendar View
        </h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => changeMonth(-1)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            ←
          </button>
          <span className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {/* Weekday Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className={`p-2 text-center text-sm font-medium ${
              isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {getMonthData().map((day, index) => {
          const objectives = day ? getObjectivesForDay(day) : [];
          const hasObjectives = objectives.length > 0;

          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } relative group`}
            >
              {day && (
                <>
                  <div
                    className={`flex items-center justify-center w-8 h-8 mb-1 rounded-full ${
                      isToday(day)
                        ? isDarkMode
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-600 text-white'
                        : isDarkMode
                        ? 'text-gray-400'
                        : 'text-gray-600'
                    }`}
                  >
                    {day}
                  </div>
                  <div className="space-y-1">
                    {objectives.slice(0, 3).map((obj) => (
                      <div
                        key={obj.id}
                        onClick={() => onEditObjective(obj.id)}
                        className={`p-1 rounded text-xs cursor-pointer transition-colors ${
                          getProgressColor(obj.progress)
                        } ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-700'
                        } hover:brightness-110`}
                      >
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 flex-shrink-0">
                            <ProgressChart
                              progress={obj.progress}
                              size={12}
                              strokeWidth={2}
                              isDarkMode={isDarkMode}
                            />
                          </div>
                          <span className="truncate">{obj.title}</span>
                        </div>
                      </div>
                    ))}
                    {objectives.length > 3 && (
                      <div className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        +{objectives.length - 3} more
                      </div>
                    )}
                  </div>

                  {/* Hover Tooltip */}
                  {hasObjectives && objectives.length > 3 && (
                    <div className={`absolute left-0 top-full mt-2 w-64 p-3 rounded-lg shadow-lg
                      opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none
                      ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}
                    >
                      <div className="space-y-2">
                        {objectives.map((obj) => (
                          <div
                            key={obj.id}
                            className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4">
                                <ProgressChart
                                  progress={obj.progress}
                                  size={16}
                                  strokeWidth={2}
                                  isDarkMode={isDarkMode}
                                />
                              </div>
                              <span className="font-medium">{obj.title}</span>
                            </div>
                            <div className={`text-xs mt-1 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              Progress: {obj.progress}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
