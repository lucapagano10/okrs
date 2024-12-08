import React, { useState, useEffect } from 'react';
import { Objective, groupObjectivesByTime, ObjectiveStatus, KeyResultStatus } from '../types/okr';
import { CreateObjectiveForm } from './CreateObjectiveForm';
import { TimeGroupView } from './TimeGroupView';
import { TimeFilter } from './TimeFilter';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ConfirmationModal } from './ConfirmationModal';

interface OKRDashboardProps {
  isDarkMode?: boolean;
}

export const OKRDashboard: React.FC<OKRDashboardProps> = ({ isDarkMode = false }) => {
  const { user } = useAuth();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [filteredObjectives, setFilteredObjectives] = useState<Objective[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 'current' | 'past' | 'future'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // Fetch objectives and categories when user changes
  useEffect(() => {
    if (user) {
      fetchObjectives();
      fetchCategories();
    }
  }, [user]);

  const fetchObjectives = async () => {
    if (!user?.id) return;
    setIsLoading(true);

    try {
      const { data: objectives, error } = await supabase
        .from('objectives')
        .select(`
          *,
          key_results (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      if (objectives) {
        const formattedObjectives: Objective[] = objectives.map(obj => ({
          id: obj.id,
          title: obj.title,
          description: obj.description,
          category: obj.category,
          startDate: new Date(obj.start_date),
          endDate: new Date(obj.end_date),
          progress: obj.progress,
          userId: obj.user_id,
          status: obj.status as ObjectiveStatus,
          keyResults: obj.key_results.map((kr: any) => ({
            id: kr.id,
            description: kr.description,
            targetValue: kr.target_value,
            currentValue: kr.current_value,
            unit: kr.unit,
            startDate: new Date(kr.start_date),
            endDate: new Date(kr.end_date),
            progress: kr.progress,
            objectiveId: kr.objective_id,
            status: kr.status as KeyResultStatus
          }))
        }));
        setObjectives(formattedObjectives);
        showNotification('Objectives loaded successfully');
      }
    } catch (error) {
      console.error('Error fetching objectives:', error);
      showNotification('Failed to load objectives', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!user?.id) return;

    try {
      const { data: categories, error } = await supabase
        .from('user_categories')
        .select('name')
        .eq('user_id', user.id);

      if (error) throw error;

      if (categories) {
        setCategories(categories.map(c => c.name));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Filter objectives based on search query, time filter, and category filter
  useEffect(() => {
    let filtered = objectives;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(obj =>
        obj.title.toLowerCase().includes(query) ||
        obj.description.toLowerCase().includes(query) ||
        obj.category.toLowerCase().includes(query) ||
        obj.keyResults.some(kr => kr.description.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(obj => obj.category === categoryFilter);
    }

    // Apply time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(obj => {
        const startDate = new Date(obj.startDate);
        const endDate = new Date(obj.endDate);

        switch (timeFilter) {
          case 'current':
            return startDate <= now && endDate >= now;
          case 'past':
            return endDate < now;
          case 'future':
            return startDate > now;
          default:
            return true;
        }
      });
    }

    setFilteredObjectives(filtered);
  }, [timeFilter, categoryFilter, objectives, searchQuery]);

  const handleAddObjective = async (objective: Omit<Objective, 'id' | 'progress' | 'userId' | 'status'>) => {
    if (!user?.id) return;

    try {
      const { data: newObjective, error: objectiveError } = await supabase
        .from('objectives')
        .insert([{
          title: objective.title,
          description: objective.description,
          category: objective.category,
          start_date: objective.startDate.toISOString(),
          end_date: objective.endDate.toISOString(),
          progress: 0,
          user_id: user.id,
          status: 'not-started'
        }])
        .select()
        .single();

      if (objectiveError) throw objectiveError;

      if (newObjective) {
        const keyResultPromises = objective.keyResults.map(kr =>
          supabase
            .from('key_results')
            .insert([{
              description: kr.description,
              target_value: kr.targetValue,
              current_value: 0,
              unit: kr.unit,
              start_date: kr.startDate.toISOString(),
              end_date: kr.endDate.toISOString(),
              progress: 0,
              objective_id: newObjective.id,
              status: 'not-started'
            }])
        );

        await Promise.all(keyResultPromises);
        await fetchObjectives();
        showNotification('Objective created successfully');
      }
    } catch (error) {
      console.error('Error adding objective:', error);
      showNotification('Failed to create objective', 'error');
    }
    setIsFormOpen(false);
  };

  const handleEditObjective = (objectiveId: string) => {
    const objective = objectives.find(obj => obj.id === objectiveId);
    if (objective) {
      setEditingObjective(objective);
      setIsFormOpen(true);
    }
  };

  const handleDeleteObjective = async (id: string) => {
    try {
      await supabase.from('objectives').delete().eq('id', id);
      await fetchObjectives();
      showNotification('Objective deleted successfully');
    } catch (error) {
      console.error('Error deleting objective:', error);
      showNotification('Failed to delete objective', 'error');
    }
  };

  const handleUpdateProgress = async (objectiveId: string, keyResultId: string, currentValue: number) => {
    try {
      const keyResult = objectives
        .find(obj => obj.id === objectiveId)
        ?.keyResults.find(kr => kr.id === keyResultId);

      if (keyResult) {
        const progress = (currentValue / keyResult.targetValue) * 100;

        await supabase
          .from('key_results')
          .update({
            current_value: currentValue,
            progress
          })
          .eq('id', keyResultId);

        // Update objective progress
        const objective = objectives.find(obj => obj.id === objectiveId);
        if (objective) {
          const updatedKeyResults = objective.keyResults.map(kr =>
            kr.id === keyResultId ? { ...kr, currentValue, progress } : kr
          );
          const overallProgress = updatedKeyResults.reduce((sum, kr) => sum + kr.progress, 0) / updatedKeyResults.length;

          await supabase
            .from('objectives')
            .update({ progress: overallProgress })
            .eq('id', objectiveId);

          await fetchObjectives();
          showNotification('Progress updated successfully');
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      showNotification('Failed to update progress', 'error');
    }
  };

  const handleAddCategory = async (name: string) => {
    if (!user?.id) return;

    // Validate category name
    const trimmedName = name.trim().toLowerCase();
    if (!trimmedName) return;

    // Check if category already exists
    if (categories.includes(trimmedName)) {
      showNotification('Category already exists', 'error');
      return;
    }

    try {
      await supabase
        .from('user_categories')
        .insert({
          name: trimmedName,
          user_id: user.id
        });
      await fetchCategories();
      showNotification('Category added successfully');
      setNewCategoryInput('');
      setIsAddingCategory(false);
    } catch (error) {
      console.error('Error adding category:', error);
      showNotification('Failed to add category', 'error');
    }
  };

  const handleDeleteCategory = async (category: string) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const confirmDeleteCategory = async (category: string) => {
    if (!user) return;
    try {
      // Delete all objectives in this category
      await supabase
        .from('objectives')
        .delete()
        .eq('category', category)
        .eq('user_id', user.id);

      // Delete the category
      await supabase
        .from('user_categories')
        .delete()
        .eq('name', category)
        .eq('user_id', user.id);

      await fetchCategories();
      await fetchObjectives();
      setShowDeleteModal(false);
      showNotification('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      showNotification('Failed to delete category', 'error');
    }
  };

  const groupedObjectives = groupObjectivesByTime(filteredObjectives);

  // Get category counts
  const categoryCounts = objectives.reduce((acc, obj) => {
    acc[obj.category] = (acc[obj.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg transition-all transform ${
          toastType === 'success'
            ? isDarkMode ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'
            : isDarkMode ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800'
        }`}>
          {toastMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">My OKRs</h1>
          <button
            onClick={() => setIsFormOpen(true)}
            className={`px-4 py-2 rounded-lg font-medium ${
              isDarkMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Add New Objective
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Search and Time Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search objectives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <TimeFilter
              selectedFilter={timeFilter}
              onFilterChange={setTimeFilter}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Category Labels */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Add Category Button/Input */}
            <div className="relative">
              {isAddingCategory ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddCategory(newCategoryInput);
                  }}
                  className="flex items-center"
                >
                  <input
                    type="text"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    placeholder="New category..."
                    autoFocus
                    className={`w-32 px-3 py-1 rounded-l-full text-sm transition-all outline-none ${
                      isDarkMode
                        ? 'bg-gray-800 text-white placeholder-gray-500 focus:bg-gray-700'
                        : 'bg-white text-gray-900 placeholder-gray-400'
                    } border-2 border-r-0 ${
                      isDarkMode ? 'border-gray-700 focus:border-blue-500' : 'border-gray-200 focus:border-blue-500'
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsAddingCategory(false);
                        setNewCategoryInput('');
                      }
                    }}
                    onBlur={() => {
                      if (!newCategoryInput.trim()) {
                        setIsAddingCategory(false);
                      }
                    }}
                  />
                  <button
                    type="submit"
                    className={`px-2 py-1 rounded-r-full text-sm font-medium transition-colors ${
                      isDarkMode
                        ? 'bg-gray-800 text-gray-300 hover:text-white border-2 border-l-0 border-gray-700'
                        : 'bg-white text-gray-600 hover:text-gray-900 border-2 border-l-0 border-gray-200'
                    }`}
                  >
                    Add
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsAddingCategory(true)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    isDarkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } border-2 border-transparent hover:border-gray-200 flex items-center gap-1`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Category</span>
                </button>
              )}
            </div>

            {/* All Categories Label */}
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                categoryFilter === 'all'
                  ? isDarkMode
                    ? 'bg-blue-600 text-white ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900'
                    : 'bg-blue-600 text-white ring-2 ring-blue-500 ring-offset-2'
                  : isDarkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                categoryFilter === 'all'
                  ? 'bg-white bg-opacity-20'
                  : isDarkMode
                  ? 'bg-gray-700'
                  : 'bg-gray-200'
              }`}>
                {objectives.length}
              </span>
            </button>

            {/* Category Labels */}
            {categories.map(category => (
              <div key={category} className="group relative">
                <button
                  onClick={() => setCategoryFilter(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    categoryFilter === category
                      ? isDarkMode
                        ? 'bg-blue-600 text-white ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900'
                        : 'bg-blue-600 text-white ring-2 ring-blue-500 ring-offset-2'
                      : isDarkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                  <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                    categoryFilter === category
                      ? 'bg-white bg-opacity-20'
                      : isDarkMode
                      ? 'bg-gray-700'
                      : 'bg-gray-200'
                  }`}>
                    {categoryCounts[category] || 0}
                  </span>
                </button>

                {/* Delete Button - Shows on Hover */}
                <button
                  onClick={() => handleDeleteCategory(category)}
                  className={`absolute -right-2 -top-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                    isDarkMode
                      ? 'bg-gray-700 text-red-400 hover:bg-gray-600 hover:text-red-300'
                      : 'bg-white text-red-500 hover:text-red-600 shadow-sm'
                  }`}
                  title="Delete Category"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-current border-t-transparent"></div>
          </div>
        ) : groupedObjectives.length === 0 ? (
          <div className={`text-center py-12 rounded-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {searchQuery || categoryFilter !== 'all' ? (
              <>
                <h3 className="text-xl font-medium mb-2">No matching objectives found</h3>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Try adjusting your search or filter criteria
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-medium mb-2">No objectives yet</h3>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Click "Add New Objective" to get started
                </p>
              </>
            )}
          </div>
        ) : (
          groupedObjectives.map((group) => (
            <TimeGroupView
              key={`${group.startDate.toISOString()}-${group.endDate.toISOString()}`}
              group={group}
              onEdit={handleEditObjective}
              onDelete={handleDeleteObjective}
              onUpdateProgress={handleUpdateProgress}
              isDarkMode={isDarkMode}
            />
          ))
        )}
      </div>

      {/* Existing modals and forms */}
      {isFormOpen && (
        <CreateObjectiveForm
          onCancel={() => setIsFormOpen(false)}
          onSubmit={handleAddObjective}
          availableCategories={categories}
          initialObjective={editingObjective}
          isDarkMode={isDarkMode}
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          if (categoryToDelete) {
            confirmDeleteCategory(categoryToDelete);
            setCategoryToDelete(null);
          }
        }}
        title="Delete Category"
        message="Are you sure you want to delete this category? All objectives in this category will also be deleted."
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
