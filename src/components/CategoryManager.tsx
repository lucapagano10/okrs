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
          onClick={() => setIsAdding(true)}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            isDarkMode
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Add Category
        </button>
      </div>

      {isAdding && (
        <div className="absolute top-full mt-2 right-0 z-10">
          <div className={`p-4 rounded-lg shadow-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className={`block w-64 rounded-md shadow-sm text-sm ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter category name"
              />
              <div className="flex justify-end space-x-2">
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
                <button
                  type="submit"
                  className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={`mt-4 space-y-2 ${categories.length === 0 ? 'hidden' : ''}`}>
        {categories.map((category) => (
          <div key={category} className={`flex items-center justify-between p-2 rounded-md ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>
              {category}
            </span>
            <button
              onClick={() => onDeleteCategory(category)}
              className={`px-2 py-1 text-sm rounded-md ${
                isDarkMode
                  ? 'text-red-400 hover:text-red-300'
                  : 'text-red-600 hover:text-red-700'
              }`}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
