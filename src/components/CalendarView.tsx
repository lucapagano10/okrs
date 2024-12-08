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

  const getBackgroundColor = (progress: number) => {
    if (progress >= 80) return isDarkMode ? 'bg-green-950/50' : 'bg-green-50';
    if (progress >= 50) return isDarkMode ? 'bg-blue-950/50' : 'bg-blue-50';
    if (progress >= 20) return isDarkMode ? 'bg-yellow-950/50' : 'bg-yellow-50';
    return isDarkMode ? 'bg-red-950/50' : 'bg-red-50';
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
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
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

      {/* Calendar Container */}
      <div className={`rounded-lg p-6 ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
        {/* Calendar Grid */}
        <div className={`grid grid-cols-7 gap-[1px] rounded-lg overflow-hidden ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          {/* Weekday Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className={`p-3 text-center text-sm font-medium ${
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
                className={`min-h-[140px] relative group ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                {day && (
                  <div className="h-full p-2">
                    <div className={`flex justify-center mb-2`}>
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                        isToday(day)
                          ? isDarkMode
                            ? 'bg-blue-500 text-white'
                            : 'bg-blue-600 text-white'
                          : isDarkMode
                          ? 'text-gray-400'
                          : 'text-gray-600'
                      }`}>
                        {day}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {objectives.slice(0, 3).map((obj) => (
                        <div
                          key={obj.id}
                          onClick={() => onEditObjective(obj.id)}
                          className={`p-1.5 rounded text-xs cursor-pointer transition-colors ${
                            getBackgroundColor(obj.progress)
                          } hover:brightness-110`}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 flex-shrink-0">
                              <ProgressChart
                                progress={obj.progress}
                                size={12}
                                strokeWidth={2}
                                isDarkMode={isDarkMode}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium truncate ${
                                isDarkMode ? 'text-gray-200' : 'text-gray-700'
                              }`}>
                                {obj.title}
                              </div>
                            </div>
                          </div>
                          <div className={`mt-0.5 text-[10px] ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {obj.progress}% complete
                          </div>
                        </div>
                      ))}
                      {objectives.length > 3 && (
                        <div className={`text-xs px-1.5 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          +{objectives.length - 3} more
                        </div>
                      )}
                    </div>

                    {/* Hover Tooltip */}
                    {hasObjectives && objectives.length > 3 && (
                      <div className={`absolute left-1/2 top-full mt-2 -translate-x-1/2 w-64 p-3 rounded-lg shadow-lg
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
