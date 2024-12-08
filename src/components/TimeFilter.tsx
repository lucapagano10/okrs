import React from 'react';

type TimeFilterOption = 'all' | 'current' | 'past' | 'future';

interface TimeFilterProps {
  selectedFilter: TimeFilterOption;
  onFilterChange: (filter: TimeFilterOption) => void;
  isDarkMode?: boolean;
}

export const TimeFilter: React.FC<TimeFilterProps> = ({
  selectedFilter,
  onFilterChange,
  isDarkMode = false
}) => {
  const filters: { value: TimeFilterOption; label: string }[] = [
    { value: 'all', label: 'All Time' },
    { value: 'current', label: 'Current' },
    { value: 'future', label: 'Upcoming' },
    { value: 'past', label: 'Past' }
  ];

  return (
    <div className="flex space-x-2">
      {filters.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onFilterChange(value)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            selectedFilter === value
              ? isDarkMode
                ? 'bg-blue-600 text-white'
                : 'bg-blue-600 text-white'
              : isDarkMode
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
