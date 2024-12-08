import { useState } from 'react';
import { DEFAULT_CATEGORIES } from '../types/okr';

interface CategoryManagerProps {
  categories: string[];
  onUpdateCategories: (categories: string[]) => void;
  isDarkMode?: boolean;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onUpdateCategories,
  isDarkMode = false,
}) => {
  const [newCategory, setNewCategory] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim() && !categories.includes(newCategory.trim().toLowerCase())) {
      onUpdateCategories([...categories, newCategory.trim().toLowerCase()]);
      setNewCategory('');
    }
  };

  const handleDeleteCategory = (category: string) => {
    if (!DEFAULT_CATEGORIES.includes(category as any)) {
      onUpdateCategories(categories.filter(c => c !== category));
    }
  };

  const handleResetCategories = () => {
    onUpdateCategories([...DEFAULT_CATEGORIES]);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className={`text-sm font-medium ${
          isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        Manage Categories
      </button>
    );
  }

  return (
    <div className={`p-4 rounded-lg ${
      isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Manage Categories
        </h3>
        <button
          onClick={() => setIsEditing(false)}
          className={`p-1 rounded-lg ${
            isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleAddCategory} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Add new category"
            className={`flex-1 px-3 py-1 text-sm rounded-md ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
          />
          <button
            type="submit"
            className={`px-3 py-1 text-sm font-medium rounded-md ${
              isDarkMode
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Add
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {categories.map(category => (
          <div
            key={category}
            className={`flex items-center justify-between py-2 px-3 rounded-md ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}
          >
            <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              {category}
            </span>
            {!DEFAULT_CATEGORIES.includes(category as any) && (
              <button
                onClick={() => handleDeleteCategory(category)}
                className={`p-1 rounded-lg ${
                  isDarkMode
                    ? 'text-red-400 hover:text-red-300 hover:bg-gray-600'
                    : 'text-red-500 hover:text-red-600 hover:bg-gray-100'
                }`}
                title="Delete category"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleResetCategories}
          className={`text-sm ${
            isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
};
