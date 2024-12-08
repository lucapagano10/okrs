import React, { useState, useEffect } from 'react';
import { Objective, groupObjectivesByTime, ObjectiveStatus, KeyResultStatus } from '../types/okr';
import { TimeGroupView } from './TimeGroupView';
import { TimelineView } from './TimelineView';
import { CalendarView } from './CalendarView';
import { CategoryFilter } from './CategoryFilter';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch objectives and categories when user changes
  useEffect(() => {
    if (user) {
      fetchObjectives();
      fetchCategories();
    }
  }, [user]);

  // Update filtered objectives when objectives or selected category changes
  useEffect(() => {
    if (selectedCategory) {
      setFilteredObjectives(objectives.filter(obj => obj.category === selectedCategory));
    } else {
      setFilteredObjectives(objectives);
    }
  }, [objectives, selectedCategory]);

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

  const handleAddCategory = async (name: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_categories')
        .insert([{ name, user_id: user.id }]);

      if (error) throw error;

      await fetchCategories();
      showNotification('Category added successfully');
    } catch (error) {
      console.error('Error adding category:', error);
      showNotification('Failed to add category', 'error');
    }
  };

  const handleDeleteCategory = async (category: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_categories')
        .delete()
        .eq('name', category)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchCategories();
      if (selectedCategory === category) {
        setSelectedCategory(null);
      }
      showNotification('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      showNotification('Failed to delete category', 'error');
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
            status: 'not-started' as const
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
                status: 'not-started' as const
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
                status: 'not-started' as const,
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
            status: 'not-started' as const
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
              status: 'not-started' as const
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

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <button
              onClick={handleAddNewObjective}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Add New Objective
            </button>

            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-lg overflow-hidden border ${
                isDarkMode ? 'border-gray-800' : 'border-gray-200'
              }">
                {(['list', 'timeline', 'calendar'] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      viewMode === mode
                        ? isDarkMode
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-100 text-gray-900'
                        : isDarkMode
                          ? 'text-gray-400 hover:text-gray-200'
                          : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Filter by Category
                </h2>
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  isDarkMode={isDarkMode}
                />
              </div>
              <button
                onClick={() => setIsManagingCategories(true)}
                className={`text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors ${
                  isDarkMode ? 'text-blue-400 hover:text-blue-300' : ''
                }`}
              >
                + Add New
              </button>
            </div>
          </div>

          {/* Main content area */}
          <div className={`rounded-2xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-current border-t-transparent text-blue-500"></div>
              </div>
            ) : (
              <>
                {viewMode === 'list' && (
                  <div className="space-y-6">
                    {Object.entries(groupObjectivesByTime(filteredObjectives)).map(([key, group]) => (
                      <TimeGroupView
                        key={key}
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
        </div>
      </div>

      {/* Modals */}
      <OKRModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveObjective}
        objective={selectedObjective}
        categories={categories}
        isDarkMode={isDarkMode}
      />

      {/* Toast */}
      {showToast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
          toastType === 'success'
            ? isDarkMode ? 'bg-green-500' : 'bg-green-600'
            : isDarkMode ? 'bg-red-500' : 'bg-red-600'
        } text-white`}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};
