import React from 'react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  onAddCategory: (name: string) => Promise<void>;
  onDeleteCategory: (category: string) => Promise<void>;
  isDarkMode?: boolean;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  isDarkMode = false,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onCategorySelect(null)}
        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
          selectedCategory === null
            ? isDarkMode
              ? 'bg-blue-600 text-white'
              : 'bg-blue-600 text-white'
            : isDarkMode
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategorySelect(category)}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            selectedCategory === category
              ? isDarkMode
                ? 'bg-blue-600 text-white'
                : 'bg-blue-600 text-white'
              : isDarkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};
