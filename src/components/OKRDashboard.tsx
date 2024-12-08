import React, { useState, useEffect } from 'react';
import { Objective, TimePeriod, groupObjectivesByTime, getCurrentQuarter, getNextQuarter, formatQuarter } from '../types/okr';
import { CreateObjectiveForm } from './CreateObjectiveForm';
import { ConfirmationModal } from './ConfirmationModal';
import { TimeGroupView } from './TimeGroupView';

interface OKRDashboardProps {
  isDarkMode?: boolean;
}

const timePeriodOptions: { value: TimePeriod; label: string; description: string }[] = [
  {
    value: 'current-quarter',
    label: formatQuarter(getCurrentQuarter().year, getCurrentQuarter().quarter),
    description: 'Current Quarter'
  },
  {
    value: 'next-quarter',
    label: formatQuarter(getNextQuarter().year, getNextQuarter().quarter),
    description: 'Next Quarter'
  },
  {
    value: 'all',
    label: 'All Time',
    description: 'View all quarters'
  },
];

export const OKRDashboard: React.FC<OKRDashboardProps> = ({ isDarkMode = false }) => {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [categories, setCategories] = useState<string[]>(['Personal', 'Professional', 'Health', 'Financial']);
  const [showForm, setShowForm] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>('current-quarter');

  useEffect(() => {
    const savedObjectives = localStorage.getItem('objectives');
    const savedCategories = localStorage.getItem('categories');

    if (savedObjectives) {
      setObjectives(JSON.parse(savedObjectives));
    }

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('objectives', JSON.stringify(objectives));
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [objectives, categories]);

  const handleAddObjective = (objective: Omit<Objective, 'id' | 'progress'>) => {
    const newObjective: Objective = {
      ...objective,
      id: Date.now().toString(),
      progress: 0,
      keyResults: objective.keyResults.map(kr => ({
        ...kr,
        currentValue: 0,
        progress: 0,
      })),
    };

    setObjectives([...objectives, newObjective]);
    setShowForm(false);
  };

  const handleEditObjective = (objective: Omit<Objective, 'id' | 'progress'>) => {
    if (editingObjective) {
      const updatedObjective: Objective = {
        ...objective,
        id: editingObjective.id,
        progress: editingObjective.progress,
      };

      setObjectives(objectives.map(obj =>
        obj.id === editingObjective.id ? updatedObjective : obj
      ));
      setEditingObjective(null);
      setShowForm(false);
    }
  };

  const handleDeleteObjective = (id: string) => {
    setObjectives(objectives.filter(obj => obj.id !== id));
  };

  const handleAddCategory = () => {
    const newCategory = prompt('Enter new category name:');
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
    }
  };

  const handleDeleteCategory = (category: string) => {
    const objectivesInCategory = objectives.filter(obj => obj.category === category);
    if (objectivesInCategory.length > 0) {
      setCategoryToDelete(category);
      setShowDeleteModal(true);
    } else {
      setCategories(categories.filter(cat => cat !== category));
    }
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      setObjectives(objectives.filter(obj => obj.category !== categoryToDelete));
      setCategories(categories.filter(cat => cat !== categoryToDelete));
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      if (selectedCategory === categoryToDelete) {
        setSelectedCategory('all');
      }
    }
  };

  const handleUpdateProgress = (objectiveId: string, keyResultId: string, currentValue: number) => {
    setObjectives(objectives.map(objective => {
      if (objective.id === objectiveId) {
        const updatedKeyResults = objective.keyResults.map(kr => {
          if (kr.id === keyResultId) {
            const progress = (currentValue / kr.targetValue) * 100;
            return { ...kr, currentValue, progress };
          }
          return kr;
        });

        const totalProgress = updatedKeyResults.reduce((sum, kr) => sum + kr.progress, 0) / updatedKeyResults.length;

        return {
          ...objective,
          keyResults: updatedKeyResults,
          progress: totalProgress,
        };
      }
      return objective;
    }));
  };

  const filteredObjectives = objectives.filter(obj =>
    selectedCategory === 'all' || obj.category === selectedCategory
  );

  const timeGroups = groupObjectivesByTime(filteredObjectives, selectedTimePeriod);

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              OKR Dashboard
            </h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleAddCategory}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Add Category
            </button>
            <button
              onClick={() => setShowForm(true)}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                isDarkMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Add Objective
            </button>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {timePeriodOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedTimePeriod(option.value)}
                  className={`relative p-6 rounded-xl border transition-all duration-150 ${
                    selectedTimePeriod === option.value
                      ? isDarkMode
                        ? 'bg-blue-900/30 border-blue-500 ring-2 ring-blue-500'
                        : 'bg-blue-50 border-blue-500 ring-2 ring-blue-500'
                      : isDarkMode
                        ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {option.description}
                    </span>
                    <span className={`mt-1 text-lg font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {option.label}
                    </span>
                  </div>
                  {selectedTimePeriod === option.value && (
                    <div className={`absolute top-3 right-3 ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  selectedCategory === 'all'
                    ? isDarkMode
                      ? 'bg-gray-800 text-white shadow-lg shadow-gray-800/50'
                      : 'bg-gray-900 text-white shadow-sm'
                    : isDarkMode
                      ? 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                All Categories
              </button>
              {categories.map(category => (
                <div key={category} className="relative group">
                  <button
                    onClick={() => setSelectedCategory(category)}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      selectedCategory === category
                        ? isDarkMode
                          ? 'bg-gray-800 text-white shadow-lg shadow-gray-800/50'
                          : 'bg-gray-900 text-white shadow-sm'
                        : isDarkMode
                          ? 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className={`absolute -top-1.5 -right-1.5 p-1.5 rounded-full transform hover:scale-110 transition-all opacity-0 group-hover:opacity-100 ${
                      isDarkMode
                        ? 'bg-gray-700 text-red-400 hover:text-red-300 hover:bg-gray-600'
                        : 'bg-white text-red-500 hover:text-red-600 shadow-sm hover:shadow-md'
                    }`}
                    title="Delete category"
                  >
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {timeGroups.length > 0 ? (
          timeGroups.map(group => (
            <TimeGroupView
              key={group.label}
              group={group}
              onEdit={(objectiveId) => {
                const objective = objectives.find(obj => obj.id === objectiveId);
                if (objective) {
                  setEditingObjective(objective);
                  setShowForm(true);
                }
              }}
              onDelete={handleDeleteObjective}
              onUpdateProgress={handleUpdateProgress}
              isDarkMode={isDarkMode}
            />
          ))
        ) : (
          <div className={`flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-lg ${
            isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'
          }`}>
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg">No objectives found for this time period</p>
            <button
              onClick={() => setShowForm(true)}
              className={`mt-4 font-medium ${
                isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              Create your first objective
            </button>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`relative w-full max-w-4xl rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <CreateObjectiveForm
                onSubmit={editingObjective ? handleEditObjective : handleAddObjective}
                onCancel={() => {
                  setShowForm(false);
                  setEditingObjective(null);
                }}
                initialObjective={editingObjective}
                isDarkMode={isDarkMode}
                availableCategories={categories}
              />
            </div>
          </div>
        )}

        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setCategoryToDelete(null);
          }}
          onConfirm={confirmDeleteCategory}
          title="Delete Category"
          message={`Are you sure you want to delete this category? This will also delete all objectives in this category.`}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};
