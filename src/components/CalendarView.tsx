import React, { useState } from 'react';
import { Objective } from '../types/okr';

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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return isDarkMode ? 'bg-green-500/20' : 'bg-green-100';
    if (progress >= 50) return isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100';
    if (progress >= 20) return isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100';
    return isDarkMode ? 'bg-red-500/20' : 'bg-red-100';
  };

  const getTextColor = (progress: number) => {
    if (progress >= 80) return isDarkMode ? 'text-green-400' : 'text-green-700';
    if (progress >= 50) return isDarkMode ? 'text-blue-400' : 'text-blue-700';
    if (progress >= 20) return isDarkMode ? 'text-yellow-400' : 'text-yellow-700';
    return isDarkMode ? 'text-red-400' : 'text-red-700';
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getObjectivesForDate = (date: Date) => {
    return objectives.filter(obj => {
      const start = new Date(obj.startDate);
      const end = new Date(obj.endDate);
      return date >= start && date <= end;
    });
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Calendar View
        </h3>
        <div className="flex items-center gap-4">
          <button
            onClick={previousMonth}
            className={`p-1 rounded-full hover:bg-opacity-10 ${
              isDarkMode ? 'hover:bg-gray-300' : 'hover:bg-gray-900'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {monthName} {year}
          </span>
          <button
            onClick={nextMonth}
            className={`p-1 rounded-full hover:bg-opacity-10 ${
              isDarkMode ? 'hover:bg-gray-300' : 'hover:bg-gray-900'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px">
        {/* Weekday Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            className={`p-2 text-center text-sm font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}

        {/* Blank Days */}
        {blanks.map(blank => (
          <div
            key={`blank-${blank}`}
            className={isDarkMode ? 'bg-gray-800' : 'bg-white'}
          />
        ))}

        {/* Calendar Days */}
        {days.map(day => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const dayObjectives = getObjectivesForDate(date);
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div
              key={day}
              className={`min-h-[100px] p-2 border ${
                isDarkMode
                  ? 'border-gray-700 hover:bg-gray-700/30'
                  : 'border-gray-200 hover:bg-gray-50'
              } ${isToday ? (isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50') : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isToday
                  ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  : isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {day}
              </div>
              <div className="space-y-1">
                {dayObjectives.map(obj => (
                  <div
                    key={obj.id}
                    onClick={() => onEditObjective(obj.id)}
                    className={`px-2 py-1 rounded text-xs cursor-pointer ${
                      getProgressColor(obj.progress)
                    }`}
                  >
                    <div className={`font-medium truncate ${getTextColor(obj.progress)}`}>
                      {obj.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
