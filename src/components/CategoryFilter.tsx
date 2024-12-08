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
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      await onAddCategory(newCategory.trim());
      setNewCategory('');
      setIsAddingNew(false);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Filter by Category
        </h3>
        <button
          onClick={() => setIsAddingNew(true)}
          className={`text-xs ${
            isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
          }`}
        >
          + Add New
        </button>
      </div>

      {isAddingNew && (
        <form onSubmit={handleAddCategory} className="mb-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Category name"
              className={`flex-1 px-2 py-1 text-sm rounded ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } border focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
            <button
              type="submit"
              className={`px-3 py-1 text-xs font-medium rounded ${
                isDarkMode
                  ? 'bg-blue-500 text-white hover:bg-blue-400'
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className={`px-3 py-1 text-xs font-medium rounded ${
                isDarkMode
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-600 hover:text-gray-500'
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategorySelect(null)}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            selectedCategory === null
              ? isDarkMode
                ? 'bg-blue-500 text-white'
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
                    ? 'bg-blue-500 text-white'
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
                    ? 'bg-red-500 text-white hover:bg-red-400'
                    : 'bg-red-600 text-white hover:bg-red-500'
                }`}
            >
              <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
