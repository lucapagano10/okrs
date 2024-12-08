import React, { useState, useEffect } from 'react';
import { Objective, groupObjectivesByTime, ObjectiveStatus, KeyResultStatus } from '../types/okr';
import { TimeGroupView } from './TimeGroupView';
import { TimelineView } from './TimelineView';
import { CalendarView } from './CalendarView';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ConfirmationModal } from './ConfirmationModal';
import { OKRModal } from './OKRModal';

type ViewMode = 'list' | 'timeline' | 'calendar';

interface OKRDashboardProps {
  isDarkMode?: boolean;
}

export const OKRDashboard: React.FC<OKRDashboardProps> = ({ isDarkMode = false }) => {
  const { user } = useAuth();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [filteredObjectives, setFilteredObjectives] = useState<Objective[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Fetch objectives and categories when user changes
  useEffect(() => {
    if (user) {
      fetchObjectives();
      fetchCategories();
    }
  }, [user]);

  // Update filtered objectives when objectives change
  useEffect(() => {
    setFilteredObjectives(objectives);
  }, [objectives]);

  const fetchObjectives = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
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
          startDate: obj.start_date,
          endDate: obj.end_date,
          progress: obj.progress,
          status: obj.status as ObjectiveStatus,
          user_id: obj.user_id,
          keyResults: obj.key_results.map(kr => ({
            id: kr.id,
            description: kr.description,
            targetValue: kr.target_value,
            currentValue: kr.current_value,
            unit: kr.unit,
            startDate: kr.start_date,
            endDate: kr.end_date,
            progress: kr.progress,
            status: kr.status as KeyResultStatus,
            objective_id: kr.objective_id
          }))
        }));

        setObjectives(formattedObjectives);
      }
    } catch (error) {
      console.error('Error fetching objectives:', error);
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

  const handleEditObjective = (objectiveId: string) => {
    const objective = objectives.find(obj => obj.id === objectiveId);
    if (objective) {
      setSelectedObjective(objective);
      setIsModalOpen(true);
    }
  };

  const handleAddNewObjective = () => {
    setSelectedObjective(null);
    setIsModalOpen(true);
  };

  const handleSaveObjective = async (objectiveData: Partial<Objective>) => {
    if (!user?.id) return;

    try {
      if (selectedObjective) {
        // Update existing objective
        const { error: objError } = await supabase
          .from('objectives')
          .update({
            title: objectiveData.title || '',
            description: objectiveData.description || '',
            category: objectiveData.category || '',
            start_date: objectiveData.startDate || new Date().toISOString(),
            end_date: objectiveData.endDate || new Date().toISOString(),
            status: 'active' as const
          })
          .eq('id', selectedObjective.id);

        if (objError) throw objError;

        // Update or create key results
        for (const kr of objectiveData.keyResults || []) {
          if (kr.id) {
            // Update existing key result
            const { error: krError } = await supabase
              .from('key_results')
              .update({
                description: kr.description || '',
                target_value: kr.targetValue || 0,
                current_value: kr.currentValue || 0,
                unit: kr.unit || '',
                start_date: kr.startDate || new Date().toISOString(),
                end_date: kr.endDate || new Date().toISOString(),
                status: 'active' as const
              })
              .eq('id', kr.id);

            if (krError) throw krError;
          } else {
            // Create new key result
            const { error: krError } = await supabase
              .from('key_results')
              .insert([{
                description: kr.description || '',
                target_value: kr.targetValue || 0,
                current_value: kr.currentValue || 0,
                unit: kr.unit || '',
                objective_id: selectedObjective.id,
                start_date: kr.startDate || new Date().toISOString(),
                end_date: kr.endDate || new Date().toISOString(),
                status: 'active' as const,
                progress: 0
              }]);

            if (krError) throw krError;
          }
        }
      } else {
        // Create new objective
        const { data: objective, error: objError } = await supabase
          .from('objectives')
          .insert([{
            title: objectiveData.title || '',
            description: objectiveData.description || '',
            category: objectiveData.category || '',
            start_date: objectiveData.startDate || new Date().toISOString(),
            end_date: objectiveData.endDate || new Date().toISOString(),
            user_id: user.id,
            progress: 0,
            status: 'active' as const
          }])
          .select()
          .single();

        if (objError || !objective) throw objError;

        // Create key results
        for (const kr of objectiveData.keyResults || []) {
          const { error: krError } = await supabase
            .from('key_results')
            .insert([{
              description: kr.description || '',
              target_value: kr.targetValue || 0,
              current_value: kr.currentValue || 0,
              unit: kr.unit || '',
              objective_id: objective.id,
              start_date: kr.startDate || new Date().toISOString(),
              end_date: kr.endDate || new Date().toISOString(),
              progress: 0,
              status: 'active' as const
            }]);

          if (krError) throw krError;
        }
      }

      fetchObjectives();
      setIsModalOpen(false);
      showNotification('Objective saved successfully');
    } catch (error) {
      console.error('Error saving objective:', error);
      showNotification('Failed to save objective', 'error');
    }
  };

  const handleDeleteObjective = async (objectiveId: string) => {
    if (!user?.id) return;

    try {
      // Delete key results first
      const { error: krError } = await supabase
        .from('key_results')
        .delete()
        .eq('objective_id', objectiveId);

      if (krError) throw krError;

      // Then delete the objective
      const { error: objError } = await supabase
        .from('objectives')
        .delete()
        .eq('id', objectiveId)
        .eq('user_id', user.id);

      if (objError) throw objError;

      fetchObjectives();
    } catch (error) {
      console.error('Error deleting objective:', error);
    }
  };

  const handleUpdateKeyResult = async (objectiveId: string, keyResultId: string, currentValue: number) => {
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }

    try {
      // First get the key result to calculate progress
      const { data: keyResult, error: krError } = await supabase
        .from('key_results')
        .select('target_value')
        .eq('id', keyResultId)
        .single();

      if (krError) {
        console.error('Error fetching key result:', krError);
        throw krError;
      }

      if (!keyResult) {
        console.error('No key result found with ID:', keyResultId);
        throw new Error('Key result not found');
      }

      const progress = (currentValue / keyResult.target_value) * 100;

      const { error } = await supabase
        .from('key_results')
        .update({
          current_value: currentValue,
          progress
        })
        .eq('id', keyResultId)
        .eq('objective_id', objectiveId);

      if (error) {
        console.error('Error updating key result:', error);
        throw error;
      }

      fetchObjectives();
      showNotification('Progress updated successfully');
    } catch (error) {
      console.error('Error in handleUpdateKeyResult:', error);
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

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Personal OKRs</h1>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Track and manage your objectives and key results
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* View Mode Switcher */}
            <div className="flex rounded-lg shadow-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'timeline'
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-white text-gray-700 border-y border-gray-300 hover:bg-gray-50'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  viewMode === 'calendar'
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Calendar
              </button>
            </div>
            <button
              onClick={handleAddNewObjective}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New Objective
            </button>
          </div>
        </div>

        {/* Category Management */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Categories
            </h2>
            {isAddingCategory ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  placeholder="Enter category name"
                  className={`px-3 py-1 text-sm rounded-md ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'border-gray-300 text-gray-900'
                  }`}
                />
                <button
                  onClick={() => handleAddCategory(newCategoryInput)}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategoryInput('');
                  }}
                  className={`px-3 py-1 text-sm rounded-md ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingCategory(true)}
                className={`px-3 py-1 text-sm rounded-md ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Add Category
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <div
                key={category}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {category}
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({categoryCounts[category] || 0})
                </span>
                <button
                  onClick={() => handleDeleteCategory(category)}
                  className="ml-1 text-red-500 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-current border-t-transparent"></div>
          </div>
        ) : (
          <>
            {viewMode === 'list' && (
              <div className="space-y-8">
                {Object.entries(groupObjectivesByTime(filteredObjectives)).map(([label, group]) => (
                  <TimeGroupView
                    key={label}
                    group={group}
                    onEdit={handleEditObjective}
                    onDelete={handleDeleteObjective}
                    onUpdateProgress={handleUpdateKeyResult}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            )}
            {viewMode === 'timeline' && (
              <TimelineView
                objectives={filteredObjectives}
                onObjectiveClick={handleEditObjective}
                isDarkMode={isDarkMode}
              />
            )}
            {viewMode === 'calendar' && (
              <CalendarView
                objectives={filteredObjectives}
                onObjectiveClick={handleEditObjective}
                isDarkMode={isDarkMode}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <OKRModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedObjective(null);
        }}
        onSave={handleSaveObjective}
        objective={selectedObjective}
        categories={categories}
        isDarkMode={isDarkMode}
      />

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
