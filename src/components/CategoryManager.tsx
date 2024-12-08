import { useState } from 'react';

interface CategoryManagerProps {
  categories: string[];
  onAddCategory: (name: string) => Promise<void>;
  onDeleteCategory: (category: string) => Promise<void>;
  isDarkMode?: boolean;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onAddCategory,
  onDeleteCategory,
  isDarkMode = false
}) => {
  const [newCategory, setNewCategory] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    // Check if category already exists
    if (categories.includes(newCategory.trim())) {
      alert('This category already exists');
      return;
    }

    try {
      await onAddCategory(newCategory.trim());
      setNewCategory('');
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  return (
    <div className="relative">
      <div className="flex space-x-2">
        <button
          onClick={() => setShowCategories(!showCategories)}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            isDarkMode
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Categories {categories.length > 0 && `(${categories.length})`}
        </button>
      </div>

      {showCategories && (
        <div className="absolute top-full mt-2 right-0 z-10">
          <div className={`p-4 rounded-lg shadow-lg w-72 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Categories
              </h3>
              <button
                onClick={() => setIsAdding(true)}
                className="px-2 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add New
              </button>
            </div>

            {isAdding && (
              <form onSubmit={handleSubmit} className="mb-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className={`flex-1 rounded-md shadow-sm text-sm ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Enter category name"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      isDarkMode
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className={`space-y-2 max-h-64 overflow-y-auto ${categories.length === 0 ? 'hidden' : ''}`}>
              {categories.map((category) => (
                <div
                  key={category}
                  className={`flex items-center justify-between p-2 rounded-md ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {category}
                  </span>
                  <button
                    onClick={() => onDeleteCategory(category)}
                    className={`p-1 rounded-md hover:bg-opacity-80 ${
                      isDarkMode
                        ? 'text-red-400 hover:text-red-300'
                        : 'text-red-600 hover:text-red-700'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {categories.length === 0 && !isAdding && (
              <div className={`text-center py-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                No categories yet. Click "Add New" to create one.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
