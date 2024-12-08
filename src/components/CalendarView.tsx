import React, { useState } from 'react';
import { Objective } from '../types/okr';
import { ProgressChart } from './ProgressChart';

interface CalendarViewProps {
  objectives: Objective[];
  onObjectiveClick: (objectiveId: string) => void;
  isDarkMode?: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  objectives,
  onObjectiveClick,
  isDarkMode = false,
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
    if (progress >= 80) return isDarkMode ? 'bg-green-500/10' : 'bg-green-50';
    if (progress >= 50) return isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50';
    if (progress >= 20) return isDarkMode ? 'bg-yellow-500/10' : 'bg-yellow-50';
    return isDarkMode ? 'bg-red-500/10' : 'bg-red-50';
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
    <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
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
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
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
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Container */}
      <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
        {/* Calendar Grid */}
        <div className={`grid grid-cols-7 gap-[1px] rounded-xl overflow-hidden ${
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
                } ${day ? 'hover:bg-opacity-95 transition-colors duration-200' : ''}`}
              >
                {day && (
                  <div className="h-full p-2">
                    <div className={`flex justify-end mb-2`}>
                      <div className={`w-7 h-7 flex items-center justify-center rounded-full
                        ${isToday(day)
                          ? isDarkMode
                            ? 'bg-blue-500 text-white font-medium'
                            : 'bg-blue-600 text-white font-medium'
                          : isDarkMode
                          ? 'text-gray-400'
                          : 'text-gray-600'
                        } ${hasObjectives ? 'ring-2 ring-offset-2 ring-offset-white ring-blue-500/20' : ''}`}
                      >
                        {day}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {objectives.slice(0, 3).map((obj) => (
                        <div
                          key={obj.id}
                          onClick={() => onObjectiveClick(obj.id)}
                          className={`p-1.5 rounded-lg text-xs cursor-pointer transition-all duration-200
                            ${getBackgroundColor(obj.progress)}
                            hover:translate-y-[-1px] hover:shadow-sm`}
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
                        </div>
                      ))}
                      {objectives.length > 3 && (
                        <div className={`text-xs px-1.5 font-medium ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
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
                                {obj.keyResults.length} Key Results
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
