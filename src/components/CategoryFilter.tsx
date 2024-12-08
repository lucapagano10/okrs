import React, { useState } from 'react';

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
  onAddCategory,
  onDeleteCategory,
  isDarkMode = false,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      await onAddCategory(newCategory.trim());
      setNewCategory('');
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
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
        <div key={category} className="relative group">
          <button
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
          <button
            onClick={() => onDeleteCategory(category)}
            className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center
              opacity-0 group-hover:opacity-100 transition-opacity ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
          >
            ×
          </button>
        </div>
      ))}
      {isAdding ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-1">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category"
            className={`w-32 px-2 py-1 text-xs rounded-full ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
            } border focus:outline-none focus:ring-1 focus:ring-blue-500`}
            autoFocus
          />
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className={`w-5 h-5 rounded-full flex items-center justify-center ${
              isDarkMode
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-500 hover:text-gray-600'
            }`}
          >
            ×
          </button>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
            isDarkMode
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          +
        </button>
      )}
    </div>
  );
};
